import cron from 'node-cron';
import { env } from '../config/env';
import { logger } from '../libs/logger';
import { jobs } from './registry';

/**
 * Local dev only. On Vercel the same job functions are driven by Vercel Cron
 * hitting POST /api/cron/:job, because a long-lived node-cron timer cannot
 * survive in a serverless function.
 */
export function startLocalScheduler(): void {
  if (!env.ENABLE_LOCAL_CRON) {
    logger.info('Local cron scheduler disabled (ENABLE_LOCAL_CRON=false)');
    return;
  }

  for (const job of jobs) {
    cron.schedule(job.schedule, () => {
      job
        .run()
        .then((result) => logger.debug(`Job ${job.name} finished`, result))
        .catch((error) => logger.error(`Job ${job.name} failed`, error));
    });
    logger.info(`Scheduled job "${job.name}" (${job.schedule})`);
  }
}
