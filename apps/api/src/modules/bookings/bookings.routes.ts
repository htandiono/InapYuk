import { Router } from 'express';

/**
 * Owner: Feature 2 - htandiono (Sprint 1, Sprint 2, Sprint 3)
 *
 * Planned endpoints:
 *   POST   /bookings/quote                  price preview via pricing.service
 *   POST   /bookings                        create a reservation
 *   GET    /bookings                        user's order list, page/filter/sort
 *   GET    /bookings/:orderNumber
 *   POST   /bookings/:id/payment-proof      .jpg .png, max 1MB
 *   PATCH  /bookings/:id/cancel             user cancel, pre-payment only
 *   GET    /tenant/bookings                 tenant order list by status
 *   PATCH  /tenant/bookings/:id/confirm     accept or reject payment proof
 *   PATCH  /tenant/bookings/:id/cancel      tenant cancel, pre-payment only
 */
const router = Router();

export default router;
