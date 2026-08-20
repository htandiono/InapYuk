import { beforeEach, describe, expect, it } from 'vitest';
import { hashPassword } from '../../../src/libs/password';
import { prisma } from '../../../src/libs/prisma';
import { createTestApp, truncateAll } from '../../../src/test/helpers';

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  async function seedVerifiedUser() {
    const passwordHash = await hashPassword('SecretPass123!');
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'Normal User',
        isVerified: true,
        passwordHash,
      },
    });
    return user;
  }

  async function seedVerifiedTenant() {
    const passwordHash = await hashPassword('TenantPass123!');
    const user = await prisma.user.create({
      data: {
        email: 'tenant@example.com',
        name: 'Tenant User',
        role: 'TENANT',
        isVerified: true,
        passwordHash,
      },
    });
    return user;
  }

  it('should login a verified user, set cookies, and return profile (200)', async () => {
    const app = createTestApp();
    const user = await seedVerifiedUser();

    const res = await app.post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'SecretPass123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(
      expect.objectContaining({
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'USER',
      }),
    );

    // Verify cookies are set
    const cookies = (res.headers['set-cookie'] as string[]) || [];
    expect(cookies).toBeDefined();
    expect(cookies.length).toBeGreaterThanOrEqual(2);
    expect(cookies.some((c: string) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
    expect(cookies.some((c: string) => c.includes('HttpOnly'))).toBe(true);

    // Verify refresh token is stored in DB
    const refreshTokens = await prisma.refreshToken.findMany({
      where: { userId: user.id },
    });
    expect(refreshTokens.length).toBe(1);
    expect(refreshTokens[0].tokenHash).toBeDefined();
  });

  it('should login a verified tenant (200)', async () => {
    const app = createTestApp();
    await seedVerifiedTenant();

    const res = await app.post('/api/auth/login').send({
      email: 'tenant@example.com',
      password: 'TenantPass123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('TENANT');
  });

  it('should return 401 on wrong password (Enumeration Defense)', async () => {
    const app = createTestApp();
    await seedVerifiedUser();

    const res = await app.post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email atau password salah');
  });

  it('should return 401 on unknown email (Enumeration Defense)', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/login').send({
      email: 'unknown@example.com',
      password: 'SecretPass123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email atau password salah');
  });

  it('should return 401 for unverified user (no passwordHash)', async () => {
    const app = createTestApp();
    await prisma.user.create({
      data: {
        email: 'unverified@example.com',
        name: 'No Pass',
        isVerified: false,
      },
    });

    const res = await app.post('/api/auth/login').send({
      email: 'unverified@example.com',
      password: 'SomePassword1!',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email atau password salah');
  });

  it('should return 422 for invalid email format', async () => {
    const app = createTestApp();

    const res = await app.post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'SomePassword1!',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
