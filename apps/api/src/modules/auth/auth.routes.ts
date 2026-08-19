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
import { registerUserSchema, registerTenantSchema, verifyEmailSchema, resendVerificationSchema, loginSchema } from './auth.schema';
import { handleRegisterUser, handleRegisterTenant, handleVerifyEmail, handleResendVerification, handleLogin } from './auth.controller';

const router = Router();

router.post('/register/user', validateBody(registerUserSchema), asyncHandler(handleRegisterUser));
router.post('/register/tenant', validateBody(registerTenantSchema), asyncHandler(handleRegisterTenant));
router.post('/verify', validateBody(verifyEmailSchema), asyncHandler(handleVerifyEmail));
router.post('/resend-verification', validateBody(resendVerificationSchema), asyncHandler(handleResendVerification));
router.post('/login', validateBody(loginSchema), asyncHandler(handleLogin));

export default router;
