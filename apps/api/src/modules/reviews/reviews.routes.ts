import { Router } from 'express';

/**
 * Owner: Feature 2 - htandiono (Sprint 4)
 *
 * Planned endpoints:
 *   GET    /properties/:id/reviews    public, paginated
 *   POST   /reviews                   one per completed stay, after check-out
 *   GET    /tenant/reviews
 *   POST   /tenant/reviews/:id/reply
 */
const router = Router();

export default router;
