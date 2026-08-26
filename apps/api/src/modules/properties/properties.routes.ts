import { Router } from 'express';
import { getCities, getProperties, getPropertyDetail, getPropertyCalendar } from './properties.controller';

/**
 * Owner: Feature 1 - awanstywn (Sprint 2, Sprint 3)
 *
 * Planned endpoints:
 *   GET    /properties                 public catalog, server-side page/filter/sort
 *   GET    /properties/cities          public list of distinct cities
 *   GET    /properties/:slug           public detail with rooms
 *   GET    /properties/:id/calendar    monthly price calendar
 *   GET    /tenant/properties          tenant's own list
 *   POST   /tenant/properties
 *   PATCH  /tenant/properties/:id
 *   DELETE /tenant/properties/:id
 *   POST   /tenant/properties/:id/images
 */
const router = Router();

// Routes
router.get('/', getProperties);
router.get('/cities', getCities);
router.get('/:slug/calendar', getPropertyCalendar);
router.get('/:slug', getPropertyDetail);

export default router;
