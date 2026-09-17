import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/api-response';
import { logger } from '../libs/logger';
import { isProduction } from '../config/env';
import { MAX_FILE_SIZE_BYTES } from './upload.middleware';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
}

function handleMulter(error: MulterError, res: Response): void {
  if (error.code === 'LIMIT_FILE_SIZE') {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    sendError(res, 400, `File is too large. Maximum size is ${maxMb}MB`);
    return;
  }
  sendError(res, 400, error.message);
}

function handleZod(error: ZodError, res: Response): void {
  const errors = error.issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
  sendError(res, 422, 'Validation failed', errors);
}

/** Terminal error handler. Must stay registered last in app.ts. */
export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) return next(error);
  if (error instanceof AppError) return sendError(res, error.statusCode, error.message, error.errors);
  if (error instanceof MulterError) return handleMulter(error, res);
  if (error instanceof ZodError) return handleZod(error, res);

  logger.error('Unhandled error', error);
  const message = isProduction ? 'Something went wrong' : String((error as Error)?.message ?? error);
  sendError(res, 500, message);
}
