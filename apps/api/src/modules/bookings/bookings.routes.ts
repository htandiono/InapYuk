import { Router } from 'express';
import { authenticate, requireRole, requireVerified } from '../../middlewares/auth.middleware';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middlewares/validate.middleware';
import { createBooking, getBooking, listBookings, quoteBooking } from './bookings.controller';
import {
  createSchema,
  listQuerySchema,
  orderNumberParamsSchema,
  quoteSchema,
} from './bookings.schema';

/**
 * Owner: Feature 2 - htandiono (Sprint 1, Sprint 2, Sprint 3)
 *
 * Sprint 1:
 *   POST   /bookings/quote
 *   POST   /bookings
 *   GET    /bookings/:orderNumber
 *
 * Sprint 2:
 *   GET    /bookings
 *   POST   /bookings/:orderNumber/payment-proof
 *   PATCH  /bookings/:orderNumber/cancel
 *
 * Later:
 *   GET    /tenant/bookings
 *   PATCH  /tenant/bookings/:id/confirm
 *   PATCH  /tenant/bookings/:id/cancel
 */
const router = Router();

router.post('/quote', validateBody(quoteSchema), quoteBooking);
router.post(
  '/',
  authenticate,
  requireRole('USER'),
  requireVerified,
  validateBody(createSchema),
  createBooking,
);
router.get(
  '/',
  authenticate,
  requireRole('USER'),
  validateQuery(listQuerySchema),
  listBookings,
);
router.get('/:orderNumber', authenticate, validateParams(orderNumberParamsSchema), getBooking);

export default router;
