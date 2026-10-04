import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

// Mock the mailer so we never send real emails in tests.
vi.mock('../../../src/libs/mailer', () => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
  renderTemplate: vi.fn().mockReturnValue('<html>mock</html>'),
}));

// Mock rate limiter to avoid 429 in tests
vi.mock('express-rate-limit', () => ({
  default: () => (req: unknown, res: unknown, next: () => void) => next(),
}));

const { sendMail } = await import('../../../src/libs/mailer');

describe('POST /api/auth/resend-verification', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await truncateAll();
  });

  const SUCCESS_MESSAGE =
    'Jika email terdaftar dan belum terverifikasi, kami sudah mengirim link baru';

  it('should create a new token and send email for unverified user (200)', async () => {
    const app = createTestApp();

    const user = await prisma.user.create({
      data: {
        email: 'unverified@example.com',
        name: 'Unverified User',
        isVerified: false,
      },
    });

    const res = await app.post('/api/auth/resend-verification').send({
      email: 'unverified@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(SUCCESS_MESSAGE);

    // Verify a new token was created
    const tokens = await prisma.verificationToken.findMany({ where: { userId: user.id } });
    expect(tokens.length).toBe(1);

    // Verify email was sent
    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'unverified@example.com',
        template: 'email-verification',
      }),
    );
  });

  it('should return 200 without sending email if user does not exist (Enumeration Defense)', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/resend-verification').send({
      email: 'unknown@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(SUCCESS_MESSAGE);

    // Verify no email was sent
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should return 200 without sending email if user is already verified (Enumeration Defense)', async () => {
    const app = createTestApp();

    await prisma.user.create({
      data: {
        email: 'verified@example.com',
        name: 'Verified User',
        isVerified: true,
      },
    });

    const res = await app.post('/api/auth/resend-verification').send({
      email: 'verified@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(SUCCESS_MESSAGE);

    // Verify no token was created
    const tokens = await prisma.verificationToken.count();
    expect(tokens).toBe(0);

    // Verify no email was sent
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('should return 422 if email format is invalid', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/resend-verification').send({
      email: 'not-an-email',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
