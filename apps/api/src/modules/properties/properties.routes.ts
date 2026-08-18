import { Router } from 'express';

/**
 * Owner: Feature 1 - awanstywn (Sprint 2, Sprint 3)
 *
 * Planned endpoints:
 *   GET    /properties                 public catalog, server-side page/filter/sort
 *   GET    /properties/:slug           public detail with rooms
 *   GET    /properties/:id/calendar    monthly price calendar
 *   GET    /tenant/properties          tenant's own list
 *   POST   /tenant/properties
 *   PATCH  /tenant/properties/:id
 *   DELETE /tenant/properties/:id
 *   POST   /tenant/properties/:id/images
 */
const router = Router();

export default router;
