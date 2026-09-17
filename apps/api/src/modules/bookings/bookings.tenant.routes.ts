import { Router } from 'express';
import { authenticate, requireTenant, requireVerified } from '../../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.middleware';
import {
  cancelTenantOrder,
  confirmTenantOrder,
  listTenantOrders,
} from './bookings.tenant-controller';
import { cancelSchema, confirmSchema, listQuerySchema, orderNumberParamsSchema } from './bookings.schema';

/**
 * Owner: Feature 2 - htandiono (Sprint 3)
 *
 *   GET    /tenant/bookings
 *   PATCH  /tenant/bookings/:orderNumber/confirm
 *   PATCH  /tenant/bookings/:orderNumber/cancel
 */
const router = Router();

router.use(authenticate, requireTenant, requireVerified);

router.get('/', validateQuery(listQuerySchema), listTenantOrders);
router.patch(
  '/:orderNumber/confirm',
  validateParams(orderNumberParamsSchema),
  validateBody(confirmSchema),
  confirmTenantOrder,
);
router.patch(
  '/:orderNumber/cancel',
  validateParams(orderNumberParamsSchema),
  validateBody(cancelSchema),
  cancelTenantOrder,
);

export default router;
