/**
 * Vercel serves this file for every /api/* request, including the scheduled
 * jobs. Local dev still uses src/server.ts.
 */
import type { Request, Response } from 'express';
import { createApp } from '../src/app';

const app = createApp();

function requestPath(req: Request): string {
  const header = req.headers['x-forwarded-uri'];
  const forwarded = Array.isArray(header) ? header[0] : header;
  return forwarded || req.url || '/api';
}

export default function handler(req: Request, res: Response) {
  const path = requestPath(req);
  req.url = path.startsWith('/api') || path.startsWith('/uploads') ? path : `/api${path}`;
  return app(req, res);
}
