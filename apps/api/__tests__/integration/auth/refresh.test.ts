import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';
import { hashToken } from '../../../src/libs/password';
import { issueTokens } from '../../../src/libs/jwt';

describe('POST /api/auth/refresh', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  async function seedUserAndToken() {
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'Normal User',
        isVerified: true,
      },
    });

    const { refreshToken } = issueTokens({
      sub: user.id,
      role: user.role,
      email: user.email,
      isVerified: user.isVerified,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      },
    });

    return { user, refreshToken };
  }

  it('should issue a new access token for valid refresh token (200)', async () => {
    const app = createTestApp();
    const { refreshToken } = await seedUserAndToken();

    const res = await app.post('/api/auth/refresh').set('Cookie', [`refreshToken=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Token berhasil diperbarui');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c: string) => c.startsWith('accessToken='))).toBe(true);

    // Refresh token should be rotated
    expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('should return 401 and clear cookies if no refresh token provided', async () => {
    const app = createTestApp();
    await seedUserAndToken(); // Seed so DB has valid data

    const res = await app.post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Sesi Anda telah berakhir, silakan login kembali');

    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refreshToken=;'))).toBe(true);
  });

  it('should return 401 and clear cookies if refresh token is not in DB (revoked)', async () => {
    const app = createTestApp();
    const { user, refreshToken } = await seedUserAndToken();

    // Revoke by deleting from DB
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    const res = await app.post('/api/auth/refresh').set('Cookie', [`refreshToken=${refreshToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Sesi Anda telah berakhir, silakan login kembali');

    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refreshToken=;'))).toBe(true);
  });

  it('should return 401 and clear cookies if refresh token is invalid (bad signature)', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/refresh').set('Cookie', [`refreshToken=bad.token.here`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Sesi Anda telah berakhir, silakan login kembali');

    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refreshToken=;'))).toBe(true);
  });
});
