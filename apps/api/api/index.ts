/**
 * One function for every API path. Vercel only forwards a single /api file
 * reliably, so vercel.json sends the rest of the paths here.
 * Local dev still uses src/server.ts.
 */
import type { Request, Response } from 'express';
import { createApp } from '../src/app';

const app = createApp();

export default function handler(req: Request, res: Response) {
  const path = req.url || '/api';
  req.url = path.startsWith('/api') || path.startsWith('/uploads') ? path : `/api${path}`;
  return app(req, res);
}
