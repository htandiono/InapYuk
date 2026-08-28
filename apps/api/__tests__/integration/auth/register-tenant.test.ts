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

describe('POST /api/auth/register/tenant', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await truncateAll();
  });

  it('should create a user, tenant profile, and verification token (201)', async () => {
    const app = createTestApp();

    const res = await app
      .post('/api/auth/register/tenant')
      .send({ email: 'tenant@example.com', name: 'Tenant Owner', companyName: 'InapYuk Hotels' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify User row was created
    const user = await prisma.user.findUnique({
      where: { email: 'tenant@example.com' },
    });
    expect(user).not.toBeNull();
    expect(user!.role).toBe('TENANT');
    expect(user!.isVerified).toBe(false);
    expect(user!.passwordHash).toBeNull();
    expect(user!.provider).toBe('EMAIL');

    // Verify TenantProfile row was created
    const profile = await prisma.tenantProfile.findUnique({
      where: { userId: user!.id },
    });
    expect(profile).not.toBeNull();
    expect(profile!.companyName).toBe('InapYuk Hotels');

    // Verify VerificationToken row was created
    const token = await prisma.verificationToken.findFirst({
      where: { userId: user!.id, type: 'EMAIL_VERIFICATION' },
    });
    expect(token).not.toBeNull();
    expect(token!.tokenHash).toBeDefined();

    // Verify expiry is ~60 minutes from now
    const diffMs = token!.expiresAt.getTime() - Date.now();
    expect(diffMs).toBeGreaterThan(55 * 60 * 1000);
    expect(diffMs).toBeLessThanOrEqual(61 * 60 * 1000);
  });

  it('should call sendMail once with the verification template', async () => {
    const app = createTestApp();

    await app
      .post('/api/auth/register/tenant')
      .send({ email: 'mail-tenant@example.com', name: 'Mail Test', companyName: 'Mails R Us' });

    expect(sendMail).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'mail-tenant@example.com',
        template: 'email-verification',
      }),
    );
  });

  it('should return 409 when email is already registered', async () => {
    const app = createTestApp();

    // Setup an existing user
    await prisma.user.create({
      data: {
        email: 'dup-tenant@example.com',
        name: 'First',
        role: 'USER',
      }
    });

    // Duplicate registration as tenant
    const res = await app
      .post('/api/auth/register/tenant')
      .send({ email: 'dup-tenant@example.com', name: 'Second', companyName: 'Dup Inc' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Email sudah terdaftar');
  });

  it('should return 422 when companyName is missing', async () => {
    const app = createTestApp();

    const res = await app
      .post('/api/auth/register/tenant')
      .send({ email: 'valid@example.com', name: 'No Company' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
