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
import { asyncHandler } from '../../utils/async-handler';
import { validateBody } from '../../middlewares/validate.middleware';
import { authRateLimiter, resendRateLimiter } from '../../middlewares/rate-limit.middleware';
import { registerUserSchema, registerTenantSchema, verifyEmailSchema, resendVerificationSchema, loginSchema } from './auth.schema';
import { handleRegisterUser, handleRegisterTenant, handleVerifyEmail, handleCheckToken, handleResendVerification, handleLogin, handleRefreshToken, handleLogout } from './auth.controller';

const router = Router();

router.post('/register/user', authRateLimiter, validateBody(registerUserSchema), asyncHandler(handleRegisterUser));
router.post('/register/tenant', authRateLimiter, validateBody(registerTenantSchema), asyncHandler(handleRegisterTenant));
router.get('/verify/check', asyncHandler(handleCheckToken));
router.post('/verify', authRateLimiter, validateBody(verifyEmailSchema), asyncHandler(handleVerifyEmail));
router.post('/resend-verification', resendRateLimiter, validateBody(resendVerificationSchema), asyncHandler(handleResendVerification));
router.post('/login', authRateLimiter, validateBody(loginSchema), asyncHandler(handleLogin));
router.post('/refresh', handleRefreshToken);
router.post('/logout', asyncHandler(handleLogout));

export default router;
