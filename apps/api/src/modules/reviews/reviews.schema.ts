import { z } from 'zod';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../../utils/pagination';

export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
});

export const replyReviewSchema = z.object({
  comment: z.string().trim().min(10).max(1000),
});

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  hasReply: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export const reviewIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const propertyIdParamsSchema = z.object({
  propertyId: z.string().uuid(),
});
