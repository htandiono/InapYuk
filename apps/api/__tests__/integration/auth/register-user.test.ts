import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

// Mock the mailer so we never send real emails in tests.
vi.mock('../../../src/libs/mailer', () => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
  renderTemplate: vi.fn().mockReturnValue('<html>mock</html>'),
}));

// Re-import the mocked module so we can assert on it.
const { sendMail } = await import('../../../src/libs/mailer');

describe('POST /api/auth/register/user', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await truncateAll();
  });

  it('should create a user and verification token (201)', async () => {
    const app = createTestApp();

    const res = await app
      .post('/api/auth/register/user')
      .send({ email: 'test@example.com', name: 'Test User' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify User row was created
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(user).not.toBeNull();
    expect(user!.role).toBe('USER');
    expect(user!.isVerified).toBe(false);
    expect(user!.passwordHash).toBeNull();
    expect(user!.provider).toBe('EMAIL');

    // Verify VerificationToken row was created
    const token = await prisma.verificationToken.findFirst({
      where: { userId: user!.id, type: 'EMAIL_VERIFICATION' },
    });
    expect(token).not.toBeNull();
    expect(token!.tokenHash).toBeDefined();
    expect(token!.usedAt).toBeNull();

    // Verify expiry is ~60 minutes from now
    const diffMs = token!.expiresAt.getTime() - Date.now();
    expect(diffMs).toBeGreaterThan(55 * 60 * 1000); // at least 55 min
    expect(diffMs).toBeLessThanOrEqual(61 * 60 * 1000); // at most 61 min
  });

  it('should call sendMail once with the verification template', async () => {
    const app = createTestApp();

    await app
      .post('/api/auth/register/user')
      .send({ email: 'mailer@example.com', name: 'Mail Test' });

    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'mailer@example.com',
        template: 'email-verification',
      }),
    );
  });

  it('should return 409 when email is already registered', async () => {
    const app = createTestApp();

    // First registration
    await prisma.user.create({
      data: {
        email: 'dup@example.com',
        name: 'First',
        role: 'USER',
        isVerified: true,
      }
    });

    // Duplicate registration
    const res = await app
      .post('/api/auth/register/user')
      .send({ email: 'dup@example.com', name: 'Second' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Email sudah terdaftar');

    // Verify no duplicate user was created
    const count = await prisma.user.count({
      where: { email: 'dup@example.com' },
    });
    expect(count).toBe(1);
  });

  it('should return 422 when email format is invalid', async () => {
    const app = createTestApp();

    const res = await app
      .post('/api/auth/register/user')
      .send({ email: 'not-an-email', name: 'Test' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should return 422 when name is empty', async () => {
    const app = createTestApp();

    const res = await app
      .post('/api/auth/register/user')
      .send({ email: 'valid@example.com', name: '' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
