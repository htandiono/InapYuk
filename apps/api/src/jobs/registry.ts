import type { JobDefinition } from './types';
import { expireUnpaidBookingsJob } from './expire-unpaid-bookings.job';
import { checkinReminderJob } from './checkin-reminder.job';

export const jobs: JobDefinition[] = [expireUnpaidBookingsJob, checkinReminderJob];

export function findJob(name: string): JobDefinition | undefined {
  return jobs.find((job) => job.name === name);
}
