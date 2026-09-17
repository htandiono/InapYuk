import type { Prisma } from '../../generated/prisma/client';

/** Prisma client or interactive transaction — both expose these delegates. */
export type BookingDb = Pick<
  Prisma.TransactionClient,
  'booking' | 'room' | 'bookingNight' | 'roomAvailability' | 'tenantProfile'
>;
