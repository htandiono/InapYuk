import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestApp, truncateAll, getAuthCookies } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

vi.mock('../../../src/libs/google', () => ({
  verifyGoogleToken: vi.fn().mockImplementation(async (token) => {
    if (token === 'valid_token_link') {
      return {
        email: 'user@example.com',
        name: 'Linked Google User',
        picture: 'http://google.com/pic.jpg',
        sub: 'google_id_link',
      };
    }
    if (token === 'valid_token_mismatch') {
      return {
        email: 'other@example.com',
        name: 'Other Google User',
        sub: 'google_id_other',
      };
    }
    if (token === 'valid_token_taken') {
      return {
        email: 'taken@example.com',
        sub: 'google_id_taken',
      };
    }
    throw new Error('Invalid token');
  }),
}));

describe('POST /api/users/google-link', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  async function seedUser() {
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'User',
        provider: 'EMAIL',
        passwordHash: 'somehash',
        isVerified: true,
      },
    });

    const cookies = await getAuthCookies(user);
    return { user, cookies };
  }

  it('should link google account successfully (200)', async () => {
    const app = createTestApp();
    const { user, cookies } = await seedUser();

    const res = await app
      .post('/api/users/google-link')
      .set('Cookie', cookies)
      .send({ token: 'valid_token_link' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated!.provider).toBe('GOOGLE');
    expect(updated!.providerId).toBe('google_id_link');
  });

  it('should return 400 if emails do not match', async () => {
    const app = createTestApp();
    const { cookies } = await seedUser();

    const res = await app
      .post('/api/users/google-link')
      .set('Cookie', cookies)
      .send({ token: 'valid_token_mismatch' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('berbeda');
  });
});
