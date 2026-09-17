import { Router } from 'express';
import { validateParams, validateQuery } from '../../middlewares/validate.middleware';
import { getPropertyReviews } from './reviews.controller';
import { propertyIdParamsSchema, reviewListQuerySchema } from './reviews.schema';

/**
 * Owner: Feature 2 - htandiono (Sprint 4)
 *
 *   GET /properties/:propertyId/reviews
 */
const router = Router({ mergeParams: true });

router.get(
  '/',
  validateParams(propertyIdParamsSchema),
  validateQuery(reviewListQuerySchema),
  getPropertyReviews,
);

export default router;
