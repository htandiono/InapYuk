import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';
import { hashToken } from '../../../src/libs/password';
import { issueTokens } from '../../../src/libs/jwt';

describe('POST /api/auth/logout', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  async function seedUserAndToken() {
    const user = await prisma.user.create({
      data: {
        email: 'logout@example.com',
        name: 'Logout User',
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

  it('should logout and clear cookies when given a valid token (200)', async () => {
    const app = createTestApp();
    const { user, refreshToken } = await seedUserAndToken();

    const res = await app.post('/api/auth/logout').set('Cookie', [`refreshToken=${refreshToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Berhasil logout');

    // Verify cookies are cleared
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refreshToken=;'))).toBe(true);

    // Verify token is deleted from DB
    const refreshTokens = await prisma.refreshToken.findMany({ where: { userId: user.id } });
    expect(refreshTokens.length).toBe(0);
  });

  it('should return 200 and clear cookies even if no token is provided (idempotent)', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify cookies are cleared
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refreshToken=;'))).toBe(true);
  });

  it('should return 200 and clear cookies even if token is invalid or already deleted', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/logout').set('Cookie', [`refreshToken=bad.token.here`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify cookies are cleared
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.includes('accessToken=;'))).toBe(true);
    expect(cookies.some((c: string) => c.includes('refreshToken=;'))).toBe(true);
  });
});
