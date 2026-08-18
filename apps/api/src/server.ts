import { createApp } from './app';
import { env } from './config/env';
import { logger } from './libs/logger';
import { prisma } from './libs/prisma';
import { startLocalScheduler } from './jobs/local-scheduler';

async function bootstrap(): Promise<void> {
  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`InapYuk API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
    startLocalScheduler();
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, closing database connections`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

bootstrap().catch((error) => {
  logger.error('Failed to start the API', error);
  process.exit(1);
});
