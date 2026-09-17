import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import supertest from 'supertest';
import { truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';
import { issueTokens } from '../../../src/libs/jwt';
import {
  authenticate,
  requireRole,
  requireVerified,
} from '../../../src/middlewares/auth.middleware';

describe('Route Guards & Role Separation (auth.middleware)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  function setupApp() {
    const expressApp = express();
    expressApp.use(cookieParser());
    expressApp.get(
      '/api/test-protected-user',
      authenticate,
      requireRole('USER'),
      requireVerified,
      (req, res) => {
        res.status(200).json({ success: true, message: 'Welcome verified user' });
      },
    );
    expressApp.get(
      '/api/test-protected-tenant',
      authenticate,
      requireRole('TENANT'),
      requireVerified,
      (req, res) => {
        res.status(200).json({ success: true, message: 'Welcome verified tenant' });
      },
    );

    // Simple error handler matching what errorHandler does
    expressApp.use(
      (
        err: Error & { statusCode?: number },
        req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
      },
    );

    return supertest(expressApp);
  }

  async function createUserAndToken(role: 'USER' | 'TENANT', isVerified: boolean) {
    const user = await prisma.user.create({
      data: {
        email: `${role.toLowerCase()}-${isVerified ? 'verified' : 'unverified'}@example.com`,
        name: 'Test User',
        role,
        isVerified,
      },
    });

    const { accessToken } = issueTokens({
      sub: user.id,
      role: user.role,
      email: user.email,
      isVerified: user.isVerified,
    });

    return { user, accessToken };
  }

  it('should allow access to verified USER on user route', async () => {
    const app = setupApp();
    const { accessToken } = await createUserAndToken('USER', true);

    const res = await app
      .get('/api/test-protected-user')
      .set('Cookie', [`accessToken=${accessToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 Unauthorized if no accessToken cookie is present', async () => {
    const app = setupApp();

    const res = await app.get('/api/test-protected-user');

    expect(res.status).toBe(401);
  });

  it('should return 403 Forbidden ("Akses ditolak") when TENANT accesses USER route', async () => {
    const app = setupApp();
    const { accessToken } = await createUserAndToken('TENANT', true);

    const res = await app
      .get('/api/test-protected-user')
      .set('Cookie', [`accessToken=${accessToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Akses ditolak');
  });

  it('should return 403 Forbidden ("Akses ditolak") when USER accesses TENANT route', async () => {
    const app = setupApp();
    const { accessToken } = await createUserAndToken('USER', true);

    const res = await app
      .get('/api/test-protected-tenant')
      .set('Cookie', [`accessToken=${accessToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Akses ditolak');
  });

  it('should return 403 Forbidden ("Akun belum diverifikasi") when unverified user accesses protected route', async () => {
    const app = setupApp();
    const { accessToken } = await createUserAndToken('USER', false);

    const res = await app
      .get('/api/test-protected-user')
      .set('Cookie', [`accessToken=${accessToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Akun belum diverifikasi');
  });
});
