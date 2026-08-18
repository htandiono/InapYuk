import type { JobDefinition, JobResult } from './types';
import { logger } from '../libs/logger';

/**
 * Owner: Feature 2 (htandiono), Sprint 1.
 *
 * Releases bookings whose payment deadline passed without a payment proof, so
 * the room becomes bookable again. The wiring is in place; the query lands
 * with the reservation module.
 */
export async function expireUnpaidBookings(): Promise<JobResult> {
  logger.debug('expireUnpaidBookings job invoked');
  return { job: 'expire-unpaid-bookings', processed: 0 };
}

export const expireUnpaidBookingsJob: JobDefinition = {
  name: 'expire-unpaid-bookings',
  schedule: '*/5 * * * *',
  run: expireUnpaidBookings,
};
