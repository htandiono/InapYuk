import { Router } from 'express';
import { authenticate, requireRole, requireVerified } from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { postReview } from './reviews.controller';
import { createReviewSchema } from './reviews.schema';

/**
 * Owner: Feature 2 - htandiono (Sprint 4)
 *
 *   POST /reviews
 */
const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('USER'),
  requireVerified,
  validateBody(createReviewSchema),
  postReview,
);

export default router;
