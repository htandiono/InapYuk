import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

vi.mock('../../../src/libs/mailer', () => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
  renderTemplate: vi.fn().mockReturnValue('<html>mock</html>'),
}));

const { sendMail } = await import('../../../src/libs/mailer');

describe('POST /api/auth/password/reset', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await truncateAll();
  });

  const GENERIC_MESSAGE = 'Jika email terdaftar, kami telah mengirimkan link reset';

  it('should create token and send email for valid EMAIL provider user (200)', async () => {
    const app = createTestApp();

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        provider: 'EMAIL',
        isVerified: true,
      },
    });

    const res = await app.post('/api/auth/password/reset').send({ email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(GENERIC_MESSAGE);

    const token = await prisma.verificationToken.findFirst({
      where: { userId: user.id, type: 'PASSWORD_RESET' },
    });
    expect(token).not.toBeNull();
    expect(token!.usedAt).toBeNull();

    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        template: 'password-reset',
      }),
    );
  });

  it('should return 200 but not send email if user not found (enumeration defense)', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/password/reset').send({ email: 'unknown@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(GENERIC_MESSAGE);

    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should return 200 but not send email if user is GOOGLE provider (enumeration defense)', async () => {
    const app = createTestApp();

    await prisma.user.create({
      data: {
        email: 'google@example.com',
        name: 'Google User',
        role: 'USER',
        provider: 'GOOGLE',
        isVerified: true,
      },
    });

    const res = await app.post('/api/auth/password/reset').send({ email: 'google@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(GENERIC_MESSAGE);

    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should return 422 on invalid email format', async () => {
    const app = createTestApp();
    const res = await app.post('/api/auth/password/reset').send({ email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
