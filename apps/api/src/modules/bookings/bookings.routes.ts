import { Router } from 'express';

/**
 * Owner: Feature 2 - htandiono (Sprint 1, Sprint 2, Sprint 3)
 *
 * Sprint 1:
 *   POST   /bookings/quote
 *   POST   /bookings
 *   GET    /bookings/:orderNumber
 *
 * Later sprints:
 *   GET    /bookings
 *   POST   /bookings/:id/payment-proof
 *   PATCH  /bookings/:id/cancel
 *   GET    /tenant/bookings
 *   PATCH  /tenant/bookings/:id/confirm
 *   PATCH  /tenant/bookings/:id/cancel
 */
const router = Router();

export default router;
