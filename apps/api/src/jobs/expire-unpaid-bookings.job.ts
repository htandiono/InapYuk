import type { BookingStatus } from '@inapyuk/types';
import type { JobDefinition, JobResult } from './types';
import { prisma } from '../libs/prisma';
import { logger } from '../libs/logger';
import { assertTransition } from '../modules/bookings/status-machine';

const JOB = 'expire-unpaid-bookings';
const REASON = 'Payment window expired without a transfer proof';

/**
 * Owner: Feature 2 (htandiono), Sprint 1.
 *
 * Releases rooms when a guest never uploads payment proof in time. Safe to run
 * every five minutes: already-cancelled rows no longer match WAITING_PAYMENT.
 */
export async function expireUnpaidBookings(): Promise<JobResult> {
  const due = await findExpiredUnpaid();
  let processed = 0;
  for (const booking of due) {
    processed += await expireOne(booking);
  }
  logger.debug('expireUnpaidBookings finished', { processed });
  return { job: JOB, processed };
}

async function findExpiredUnpaid() {
  return prisma.booking.findMany({
    where: { status: 'WAITING_PAYMENT', paymentDeadline: { lt: new Date() } },
    select: { id: true, status: true },
  });
}

const EXPIRED_UPDATE = {
  status: 'CANCELLED' as const,
  cancelledBy: 'SYSTEM' as const,
  cancelReason: REASON,
};

async function expireOne(booking: { id: string; status: BookingStatus }): Promise<number> {
  assertTransition(booking.status, 'CANCELLED');
  const result = await prisma.booking.updateMany({
    where: { id: booking.id, status: 'WAITING_PAYMENT' },
    data: { ...EXPIRED_UPDATE, cancelledAt: new Date() },
  });
  return result.count;
}

export const expireUnpaidBookingsJob: JobDefinition = {
  name: JOB,
  schedule: '*/5 * * * *',
  run: expireUnpaidBookings,
};
