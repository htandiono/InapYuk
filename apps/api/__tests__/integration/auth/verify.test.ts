import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';
import { hashToken, verifyPassword } from '../../../src/libs/password';
import crypto from 'node:crypto';

describe('POST /api/auth/verify', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  async function seedPendingUser() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    const user = await prisma.user.create({
      data: {
        email: 'pending@example.com',
        name: 'Pending User',
        isVerified: false,
      },
    });

    const token = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    return { user, token, rawToken };
  }

  it('should verify the email and set the password (200)', async () => {
    const app = createTestApp();
    const { user, rawToken } = await seedPendingUser();

    const res = await app.post('/api/auth/verify').send({
      token: rawToken,
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Akun berhasil diverifikasi, silakan login');

    // Verify user updates
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser!.isVerified).toBe(true);
    expect(updatedUser!.passwordHash).not.toBeNull();
    
    // Verify password is encrypted correctly
    const isValid = await verifyPassword('StrongPassword123!', updatedUser!.passwordHash!);
    expect(isValid).toBe(true);

    // Verify token is marked as used
    const updatedToken = await prisma.verificationToken.findFirst({ where: { userId: user.id } });
    expect(updatedToken!.usedAt).not.toBeNull();
  });

  it('should return 400 if the token is already used', async () => {
    const app = createTestApp();
    const { rawToken, token } = await seedPendingUser();

    // Mark it as used
    await prisma.verificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    const res = await app.post('/api/auth/verify').send({
      token: rawToken,
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Link verifikasi tidak valid atau sudah kedaluwarsa');
  });

  it('should return 400 if the token is expired', async () => {
    const app = createTestApp();
    const { rawToken, token } = await seedPendingUser();

    // Mark it as expired
    await prisma.verificationToken.update({
      where: { id: token.id },
      data: { expiresAt: new Date(Date.now() - 1000) }, // in the past
    });

    const res = await app.post('/api/auth/verify').send({
      token: rawToken,
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Link verifikasi tidak valid atau sudah kedaluwarsa');
  });

  it('should return 400 if the token does not exist', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/verify').send({
      token: 'some-made-up-token',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Link verifikasi tidak valid atau sudah kedaluwarsa');
  });

  it('should return 422 if passwords do not match', async () => {
    const app = createTestApp();
    const { rawToken } = await seedPendingUser();

    const res = await app.post('/api/auth/verify').send({
      token: rawToken,
      password: 'StrongPassword123!',
      confirmPassword: 'DifferentPassword123!',
    });

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Password tidak cocok',
        }),
      ]),
    );
  });

  it('should return 422 if password is too weak', async () => {
    const app = createTestApp();
    const { rawToken } = await seedPendingUser();

    const weakPasswords = ['short', 'alllowercase123', 'ALLUPPERCASE123', 'NoNumbersHere!'];

    for (const weak of weakPasswords) {
      const res = await app.post('/api/auth/verify').send({
        token: rawToken,
        password: weak,
        confirmPassword: weak,
      });

      expect(res.status).toBe(422);
    }
  });
});
