import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

vi.mock('../../../src/libs/google', () => ({
  verifyGoogleToken: vi.fn().mockImplementation(async (token) => {
    if (token === 'valid_token_new') {
      return {
        email: 'newuser@google.com',
        name: 'New Google User',
        picture: 'http://google.com/pic.jpg',
        sub: 'google_id_1',
      };
    }
    if (token === 'valid_token_existing') {
      return {
        email: 'existing@google.com',
        name: 'Existing Google User',
        picture: 'http://google.com/pic.jpg',
        sub: 'google_id_2',
      };
    }
    if (token === 'valid_token_collision') {
      return {
        email: 'collision@example.com',
        name: 'Collision User',
        picture: 'http://google.com/pic.jpg',
        sub: 'google_id_3',
      };
    }
    throw new Error('Invalid token');
  }),
}));

describe('POST /api/auth/google', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('should register a new user and return tokens (200)', async () => {
    const app = createTestApp();
    const res = await app.post('/api/auth/google').send({ token: 'valid_token_new' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cookies = res.headers['set-cookie'];
    const cookieArray = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    expect(cookieArray.some((c: string) => c.includes('accessToken='))).toBe(true);

    const user = await prisma.user.findUnique({ where: { email: 'newuser@google.com' } });
    expect(user).not.toBeNull();
    expect(user!.provider).toBe('GOOGLE');
    expect(user!.isVerified).toBe(true);
    expect(user!.providerId).toBe('google_id_1');
  });

  it('should log in an existing google user (200)', async () => {
    await prisma.user.create({
      data: {
        email: 'existing@google.com',
        name: 'Existing Google User',
        provider: 'GOOGLE',
        providerId: 'google_id_2',
        isVerified: true,
      },
    });

    const app = createTestApp();
    const res = await app.post('/api/auth/google').send({ token: 'valid_token_existing' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 403 if email is already registered with password (collision)', async () => {
    await prisma.user.create({
      data: {
        email: 'collision@example.com',
        name: 'Collision User',
        provider: 'EMAIL',
        passwordHash: 'somehash',
        isVerified: true,
      },
    });

    const app = createTestApp();
    const res = await app.post('/api/auth/google').send({ token: 'valid_token_collision' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('sudah terdaftar dengan metode lain');
  });
});
