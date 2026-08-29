import rateLimit from 'express-rate-limit';

/**
 * Standard rate limiter for authentication endpoints (Login, Register).
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
 * Stricter rate limiter specifically for resending emails/OTPs.
 * Max 3 requests per 15 minutes per IP.
 */
export const resendRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: {
    success: false,
    message:
      'Terlalu banyak permintaan pengiriman ulang email. Silakan coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
