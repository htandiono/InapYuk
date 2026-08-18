import { Router } from 'express';

/**
 * Owner: Feature 1 - awanstywn (Sprint 3, Sprint 4)
 *
 * Planned endpoints:
 *   GET    /tenant/properties/:propertyId/rooms
 *   POST   /tenant/properties/:propertyId/rooms
 *   PATCH  /tenant/rooms/:id
 *   DELETE /tenant/rooms/:id
 *   PUT    /tenant/rooms/:id/availability     block or open a date range
 *   GET    /tenant/rooms/:id/peak-season
 *   POST   /tenant/rooms/:id/peak-season      nominal or percentage
 *   PATCH  /tenant/peak-season/:id
 *   DELETE /tenant/peak-season/:id
 */
const router = Router();

export default router;
