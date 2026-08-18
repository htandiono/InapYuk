import { Router } from 'express';

/**
 * Owner: Feature 1 - awanstywn (Sprint 5)
 *
 * Planned endpoints:
 *   GET    /users/me
 *   PATCH  /users/me
 *   PATCH  /users/me/password
 *   PATCH  /users/me/email          triggers re-verification
 *   POST   /users/me/avatar         .jpg .jpeg .png .gif, max 1MB
 *   GET    /users/me/tenant-profile
 *   PATCH  /users/me/tenant-profile
 */
const router = Router();

export default router;
