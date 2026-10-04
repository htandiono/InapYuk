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
import {
  authRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
} from '../../middlewares/rate-limit.middleware';
import {
  registerUserSchema,
  registerTenantSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  loginSchema,
  resetPasswordSchema,
  confirmResetPasswordSchema,
  googleAuthSchema,
} from './auth.schema';
import {
  handleRegisterUser,
  handleRegisterTenant,
  handleVerifyEmail,
  handleCheckToken,
  handleResendVerification,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleResetPasswordRequest,
  handleConfirmResetPassword,
  handleGoogleAuth,
  handleCheckResetToken,
} from './auth.controller';

const router = Router();

router.post(
  '/register/user',
  registerRateLimiter,
  validateBody(registerUserSchema),
  asyncHandler(handleRegisterUser),
);
router.post(
  '/register/tenant',
  registerRateLimiter,
  validateBody(registerTenantSchema),
  asyncHandler(handleRegisterTenant),
);
router.get('/verify/check', asyncHandler(handleCheckToken));
router.post(
  '/verify',
  authRateLimiter,
  validateBody(verifyEmailSchema),
  asyncHandler(handleVerifyEmail),
);
router.post(
  '/resend-verification',
  resendVerificationLimiter,
  validateBody(resendVerificationSchema),
  asyncHandler(handleResendVerification),
);
router.post('/login', loginRateLimiter, validateBody(loginSchema), asyncHandler(handleLogin));
router.post('/refresh', handleRefreshToken);
router.post('/logout', asyncHandler(handleLogout));
router.get('/password/check', asyncHandler(handleCheckResetToken));
router.post(
  '/password/reset',
  resetPasswordLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(handleResetPasswordRequest),
);
router.post(
  '/password/confirm',
  authRateLimiter,
  validateBody(confirmResetPasswordSchema),
  asyncHandler(handleConfirmResetPassword),
);
router.post(
  '/google',
  loginRateLimiter,
  validateBody(googleAuthSchema),
  asyncHandler(handleGoogleAuth),
);

export default router;
