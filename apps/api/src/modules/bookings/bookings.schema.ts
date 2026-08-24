import { z } from 'zod';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../../utils/pagination';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const bookingStatuses = [
  'WAITING_PAYMENT',
  'WAITING_CONFIRMATION',
  'PROCESSED',
  'CANCELLED',
  'COMPLETED',
] as const;

const stayFields = {
  roomId: z.string().uuid(),
  checkIn: isoDate,
  checkOut: isoDate,
  guestCount: z.coerce.number().int().positive(),
};

function isCheckOutAfterCheckIn(value: { checkIn: string; checkOut: string }): boolean {
  return value.checkOut > value.checkIn;
}

const stayRefine = {
  message: 'Check-out must be after check-in',
  path: ['checkOut'] as string[],
};

export const quoteSchema = z.object(stayFields).refine(isCheckOutAfterCheckIn, stayRefine);

export const createSchema = z
  .object({
    ...stayFields,
    paymentMethod: z.enum(['MANUAL_TRANSFER', 'PAYMENT_GATEWAY']).default('MANUAL_TRANSFER'),
  })
  .refine(isCheckOutAfterCheckIn, stayRefine);

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  status: z.enum(bookingStatuses).optional(),
  orderNumber: z.string().min(1).optional(),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  propertyId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'checkIn', 'totalPrice']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const cancelSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const confirmSchema = z.object({
  accept: z.boolean(),
  rejectionReason: z.string().trim().max(500).optional(),
});

export const orderNumberParamsSchema = z.object({
  orderNumber: z.string().regex(/^INP-\d{8}-\d{4}$/, 'Invalid order number'),
});
