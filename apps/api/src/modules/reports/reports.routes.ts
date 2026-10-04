import { Router } from 'express';
import { authenticate, requireTenant, requireVerified } from '../../middlewares/auth.middleware';
import { validateQuery } from '../../middlewares/validate.middleware';
import { getOccupancyReport, getSalesReport } from './reports.controller';
import { occupancyQuerySchema, salesQuerySchema } from './reports.schema';

/**
 * Owner: Feature 2 - htandiono (Sprint 5)
 *
 *   GET /tenant/reports/sales
 *   GET /tenant/reports/property
 */
const router = Router();

router.use(authenticate, requireTenant, requireVerified);
router.get('/sales', validateQuery(salesQuerySchema), getSalesReport);
router.get('/property', validateQuery(occupancyQuerySchema), getOccupancyReport);

export default router;
