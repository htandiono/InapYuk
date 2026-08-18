import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Only the Prisma CLI (migrate, studio, db seed) reads this URL, so it points
 * at Neon's direct connection - pooled connections cannot run migrations.
 * The running app connects separately through the driver adapter in
 * src/libs/prisma.ts using DATABASE_URL.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'],
  },
});
