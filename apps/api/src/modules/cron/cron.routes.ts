import { Router } from 'express';
import { env } from '../../config/env';
import { findJob, jobs } from '../../jobs/registry';
import { sendSuccess } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';
import { forbidden, notFound } from '../../utils/app-error';

const router = Router();

/**
 * Owner: shared infrastructure.
 *
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; the local scheduler
 * calls the job functions directly. Either way the job body is the same code.
 */
function assertCronSecret(header: string | undefined): void {
  const provided = header?.replace('Bearer ', '').trim();
  if (!provided || provided !== env.CRON_SECRET) {
    throw forbidden('Invalid cron secret');
  }
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    assertCronSecret(req.headers.authorization);
    const names = jobs.map((job) => ({ name: job.name, schedule: job.schedule }));
    sendSuccess(res, names, 'Registered jobs');
  }),
);

router.post(
  '/:job',
  asyncHandler(async (req, res) => {
    assertCronSecret(req.headers.authorization);
    const job = findJob(String(req.params.job));
    if (!job) throw notFound(`Unknown job "${req.params.job}"`);
    const result = await job.run();
    sendSuccess(res, result, `Job ${job.name} executed`);
  }),
);

export default router;
