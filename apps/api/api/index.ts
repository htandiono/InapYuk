/**
 * Vercel serverless entry point. `apps/api/src/server.ts` is the long-running
 * local dev server; this exports the same Express app as a handler so the API
 * deploys to api.inapyuk.space without a second codebase.
 */
import { createApp } from '../src/app';

export default createApp();
