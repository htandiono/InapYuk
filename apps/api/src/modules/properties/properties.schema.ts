import { z } from 'zod';

export const getPropertiesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(12),
  city: z.string().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
  guests: z.coerce.number().min(1).max(30).optional().default(2),
  name: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['name', 'price']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
}).refine((data) => {
  if ((data.checkIn && !data.checkOut) || (!data.checkIn && data.checkOut)) {
    return false;
  }
  return true;
}, {
  message: 'checkIn and checkOut must be provided together',
  path: ['checkIn'],
});

export type GetPropertiesQuery = z.infer<typeof getPropertiesQuerySchema>;

export const getPropertyPricingSchema = z.object({
  roomId: z.string().uuid('Invalid Room ID'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020),
});

export type GetPropertyPricingQuery = z.infer<typeof getPropertyPricingSchema>;
