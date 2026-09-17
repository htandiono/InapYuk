import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';
import { hashToken, verifyPassword } from '../../../src/libs/password';
import crypto from 'node:crypto';

describe('POST /api/auth/password/confirm', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  async function seedResetUser() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    const oldPasswordHash = await hashToken('OldPassword123!');

    const user = await prisma.user.create({
      data: {
        email: 'reset@example.com',
        name: 'Reset User',
        isVerified: true,
        passwordHash: oldPasswordHash,
        provider: 'EMAIL',
      },
    });

    const token = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Create a mock refresh token that should be deleted
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: 'dummyhash',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return { user, token, rawToken, oldPasswordHash };
  }

  it('should reset the password and revoke active sessions (200)', async () => {
    const app = createTestApp();
    const { user, rawToken, oldPasswordHash } = await seedResetUser();

    const res = await app.post('/api/auth/password/confirm').send({
      token: rawToken,
      password: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Password berhasil diubah, silakan login');

    // Verify user updates
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser!.passwordHash).not.toBeNull();
    expect(updatedUser!.passwordHash).not.toBe(oldPasswordHash);

    // Verify password is encrypted correctly
    const isValid = await verifyPassword('NewStrongPassword123!', updatedUser!.passwordHash!);
    expect(isValid).toBe(true);

    // Verify token is marked as used
    const updatedToken = await prisma.verificationToken.findFirst({ where: { userId: user.id } });
    expect(updatedToken!.usedAt).not.toBeNull();

    // Verify all refresh tokens are revoked
    const refreshTokens = await prisma.refreshToken.count({ where: { userId: user.id } });
    expect(refreshTokens).toBe(0);
  });

  it('should return 400 if the token is already used', async () => {
    const app = createTestApp();
    const { rawToken, token } = await seedResetUser();

    // Mark it as used
    await prisma.verificationToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    const res = await app.post('/api/auth/password/confirm').send({
      token: rawToken,
      password: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Token tidak valid atau kedaluwarsa');
  });

  it('should return 400 if the token is expired', async () => {
    const app = createTestApp();
    const { rawToken, token } = await seedResetUser();

    // Mark it as expired
    await prisma.verificationToken.update({
      where: { id: token.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const res = await app.post('/api/auth/password/confirm').send({
      token: rawToken,
      password: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Token tidak valid atau kedaluwarsa');
  });

  it('should return 400 if the token does not exist', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/password/confirm').send({
      token: 'invalid-token-123',
      password: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Token tidak valid atau kedaluwarsa');
  });
});
