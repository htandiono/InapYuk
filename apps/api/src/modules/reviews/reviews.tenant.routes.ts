import { Router } from 'express';
import { authenticate, requireTenant, requireVerified } from '../../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.middleware';
import { getTenantReviews, postTenantReply } from './reviews.controller';
import { replyReviewSchema, reviewIdParamsSchema, reviewListQuerySchema } from './reviews.schema';

/**
 * Owner: Feature 2 - htandiono (Sprint 4)
 *
 *   GET  /tenant/reviews
 *   POST /tenant/reviews/:id/reply
 */
const router = Router();

router.use(authenticate, requireTenant, requireVerified);
router.get('/', validateQuery(reviewListQuerySchema), getTenantReviews);
router.post(
  '/:id/reply',
  validateParams(reviewIdParamsSchema),
  validateBody(replyReviewSchema),
  postTenantReply,
);

export default router;
