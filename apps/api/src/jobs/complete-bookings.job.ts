import type { BookingStatus } from '@inapyuk/types';
import type { JobDefinition, JobResult } from './types';
import { prisma } from '../libs/prisma';
import { logger } from '../libs/logger';
import { toDateOnly } from '../utils/date';
import { assertTransition } from '../modules/bookings/status-machine';

const JOB = 'complete-bookings';

/**
 * Owner: Feature 2 (htandiono), Sprint 5.
 *
 * Marks PROCESSED stays as COMPLETED once the check-out date has passed so
 * guests can leave a review.
 */
export async function completeBookingsAfterCheckout(): Promise<JobResult> {
  const due = await findPastCheckouts();
  let processed = 0;
  for (const booking of due) {
    processed += await completeOne(booking);
  }
  logger.debug('completeBookingsAfterCheckout finished', { processed });
  return { job: JOB, processed };
}

async function findPastCheckouts() {
  return prisma.booking.findMany({
    where: { status: 'PROCESSED', checkOut: { lt: toDateOnly(new Date()) } },
    select: { id: true, status: true },
  });
}

async function completeOne(booking: { id: string; status: BookingStatus }): Promise<number> {
  assertTransition(booking.status, 'COMPLETED');
  const result = await prisma.booking.updateMany({
    where: { id: booking.id, status: 'PROCESSED' },
    data: { status: 'COMPLETED' },
  });
  return result.count;
}

export const completeBookingsJob: JobDefinition = {
  name: JOB,
  schedule: '0 1 * * *',
  run: completeBookingsAfterCheckout,
};
