import { Router } from 'express';
import { validateBody } from '../../middlewares/validate.middleware';
import { quoteBooking } from './bookings.controller';
import { quoteSchema } from './bookings.schema';

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

router.post('/quote', validateBody(quoteSchema), quoteBooking);

export default router;
