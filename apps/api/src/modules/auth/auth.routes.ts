import { Router } from 'express';

/**
 * Owner: Feature 1 - awanstywn (Sprint 1, Sprint 5)
 *
 * Planned endpoints:
 *   POST   /auth/register/user
 *   POST   /auth/register/tenant
 *   POST   /auth/verify              verify email + set password
 *   POST   /auth/resend-verification
 *   POST   /auth/login
 *   POST   /auth/refresh
 *   POST   /auth/logout
 *   POST   /auth/google
 *   POST   /auth/password/reset      request a reset link
 *   POST   /auth/password/confirm    confirm reset with a new password
 */
const router = Router();

export default router;
