import { z } from 'zod';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../../utils/pagination';

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export const notificationIdParamsSchema = z.object({
  id: z.string().uuid(),
});
