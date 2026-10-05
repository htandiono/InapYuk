import type { Prisma } from '../generated/prisma/client';

const HOLDING_STATUSES = [
  'WAITING_PAYMENT',
  'WAITING_CONFIRMATION',
  'PROCESSED',
  'COMPLETED',
] as const;

/**
 * Rooms stay held for active stays and for unpaid bookings still inside the
 * payment window. A null deadline is not an expiry; the cancel job only
 * matches a deadline that is already in the past.
 */
export function holdingBookingWhere(now = new Date()): Prisma.BookingWhereInput {
  return {
    status: { in: [...HOLDING_STATUSES] },
    OR: [
      { status: { not: 'WAITING_PAYMENT' } },
      { paymentDeadline: null },
      { paymentDeadline: { gt: now } },
    ],
  };
}
