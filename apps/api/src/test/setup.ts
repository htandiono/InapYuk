/**
 * Vitest global test setup for the API workspace.
 *
 * Loads `.env.test` so the strict Zod validation in `src/config/env.ts`
 * passes when tests import any module that touches `env`.
 *
 * Future tickets will add `truncateAll()` and DB lifecycle hooks here.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(__dirname, '../../.env.test') });
