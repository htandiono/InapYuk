import type { JobDefinition } from './types';
import { expireUnpaidBookingsJob } from './expire-unpaid-bookings.job';
import { checkinReminderJob } from './checkin-reminder.job';
import { completeBookingsJob } from './complete-bookings.job';

export const jobs: JobDefinition[] = [
  expireUnpaidBookingsJob,
  checkinReminderJob,
  completeBookingsJob,
];

export function findJob(name: string): JobDefinition | undefined {
  return jobs.find((job) => job.name === name);
}
