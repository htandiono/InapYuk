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
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message, error.errors);
    return;
  }
  if (error instanceof MulterError) {
    handleMulter(error, res);
    return;
  }
  if (error instanceof ZodError) {
    handleZod(error, res);
    return;
  }

  logger.error('Unhandled error', error);
  const message = isProduction
    ? 'Something went wrong'
    : String((error as Error)?.message ?? error);
  sendError(res, 500, message);
}
