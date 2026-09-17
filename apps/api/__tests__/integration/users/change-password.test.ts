import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, truncateAll, getAuthCookies } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';
import { hashPassword, verifyPassword } from '../../../src/libs/password';

describe('POST /api/users/password', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  async function seedUser() {
    const oldHash = await hashPassword('OldPassword123!');
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'User',
        role: 'USER',
        isVerified: true,
        passwordHash: oldHash,
        provider: 'EMAIL',
      },
    });

    const cookies = await getAuthCookies(user);
    return { user, cookies, oldHash };
  }

  it('should change password successfully (200)', async () => {
    const app = createTestApp();
    const { user, cookies, oldHash } = await seedUser();

    const res = await app.post('/api/users/password').set('Cookie', cookies).send({
      oldPassword: 'OldPassword123!',
      newPassword: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser!.passwordHash).not.toBe(oldHash);

    const isValid = await verifyPassword('NewStrongPassword123!', updatedUser!.passwordHash!);
    expect(isValid).toBe(true);
  });

  it('should return 400 if old password is wrong', async () => {
    const app = createTestApp();
    const { cookies } = await seedUser();

    const res = await app.post('/api/users/password').set('Cookie', cookies).send({
      oldPassword: 'WrongPassword!',
      newPassword: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Password lama salah');
  });

  it('should return 400 if user signed up with Google (no password)', async () => {
    const app = createTestApp();

    const user = await prisma.user.create({
      data: {
        email: 'google@example.com',
        name: 'Google User',
        role: 'USER',
        isVerified: true,
        provider: 'GOOGLE',
      },
    });

    const cookies = await getAuthCookies(user);

    const res = await app.post('/api/users/password').set('Cookie', cookies).send({
      oldPassword: 'SomePassword123!',
      newPassword: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Akun ini menggunakan login sosial');
  });
});
