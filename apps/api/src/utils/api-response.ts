import type { Response } from 'express';
import type { ApiFieldError, Paginated, PaginationMeta } from '@inapyuk/types';

export function sendSuccess<T>(res: Response, data: T, message = 'OK', statusCode = 200): void {
  res.status(statusCode).json({ success: true, message, data });
}

export function sendCreated<T>(res: Response, data: T, message = 'Created'): void {
  sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  meta: PaginationMeta,
  message = 'OK',
): void {
  const payload: Paginated<T> = { items, meta };
  sendSuccess(res, payload, message);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: ApiFieldError[],
): void {
  res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });
}
