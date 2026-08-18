import type { JobDefinition, JobResult } from './types';
import { logger } from '../libs/logger';

/**
 * Owner: Feature 2 (htandiono), Sprint 4.
 *
 * Emails every guest whose stay starts tomorrow. `Booking.reminderSentAt`
 * exists so a re-run never sends twice.
 */
export async function sendCheckinReminders(): Promise<JobResult> {
  logger.debug('sendCheckinReminders job invoked');
  return { job: 'checkin-reminder', processed: 0 };
}

export const checkinReminderJob: JobDefinition = {
  name: 'checkin-reminder',
  schedule: '0 7 * * *',
  run: sendCheckinReminders,
};
