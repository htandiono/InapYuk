import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const salesQuerySchema = z.object({
  groupBy: z.enum(['property', 'transaction', 'user']),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  propertyId: z.string().uuid().optional(),
  sortBy: z.enum(['date', 'total']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const occupancyQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM'),
});
