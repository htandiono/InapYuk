import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

/**
 * Standard rate limiter for generic authentication endpoints (Verify, Confirm Password).
 * Max 10 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan. Silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter specifically for Login and Google Auth.
 * Max 10 requests per 15 minutes per IP + Role.
 * This ensures Tenant login and User login have distinct quotas.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => {
    const role = (req.body?.role || 'USER').toUpperCase();
    const ip = ipKeyGenerator(req.ip ?? '');
    return `${ip}-${role}`;
  },
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter specifically for Registration.
 * Max 5 requests per 1 hour per IP.
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi setelah 1 jam.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiter for resending registration verification emails.
 */
export const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan verifikasi email. Silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiter for requesting password reset emails.
 */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan reset password. Silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limiter for changing email addresses.
 */
export const changeEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan ubah email. Silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
