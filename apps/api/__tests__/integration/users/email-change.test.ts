import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestApp, truncateAll, getAuthCookies } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';
import crypto from 'node:crypto';
import { hashToken } from '../../../src/libs/password';

vi.mock('../../../src/libs/mailer', () => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
  renderTemplate: vi.fn().mockReturnValue('<html>mock</html>'),
}));

const { sendMail } = await import('../../../src/libs/mailer');

describe('Email Change Flow', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await truncateAll();
  });

  async function seedUser() {
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'User',
        role: 'USER',
        isVerified: true,
      },
    });

    const cookies = await getAuthCookies(user);
    return { user, cookies };
  }

  describe('POST /api/users/email', () => {
    it('should create token and send email to NEW email (200)', async () => {
      const app = createTestApp();
      const { user, cookies } = await seedUser();

      const res = await app
        .post('/api/users/email')
        .set('Cookie', cookies)
        .send({ email: 'newemail@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const token = await prisma.verificationToken.findFirst({
        where: { userId: user.id, type: 'EMAIL_CHANGE' },
      });
      expect(token).not.toBeNull();
      expect(token!.newEmail).toBe('newemail@example.com');

      expect(sendMail).toHaveBeenCalledOnce();
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newemail@example.com',
          template: 'email-change',
        }),
      );
    });

    it('should return 409 if new email is already used', async () => {
      const app = createTestApp();
      const { cookies } = await seedUser();

      await prisma.user.create({
        data: {
          email: 'taken@example.com',
          name: 'Taken',
          isVerified: true,
        },
      });

      const res = await app
        .post('/api/users/email')
        .set('Cookie', cookies)
        .send({ email: 'taken@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email sudah terdaftar');
    });
  });

  describe('POST /api/users/email/verify', () => {
    it('should update email and set isVerified to true (200)', async () => {
      const app = createTestApp();
      const { user, cookies } = await seedUser();

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);

      const token = await prisma.verificationToken.create({
        data: {
          userId: user.id,
          type: 'EMAIL_CHANGE',
          tokenHash,
          newEmail: 'newemail@example.com',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      // Change user to unverified to simulate strict state
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: false },
      });

      const res = await app
        .post('/api/users/email/verify')
        .set('Cookie', cookies)
        .send({ token: rawToken });

      expect(res.status).toBe(200);

      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser!.email).toBe('newemail@example.com');
      expect(updatedUser!.isVerified).toBe(true);

      const updatedToken = await prisma.verificationToken.findUnique({ where: { id: token.id } });
      expect(updatedToken!.usedAt).not.toBeNull();
    });
  });
});
