import type { ApiFieldError } from '@inapyuk/types';

export class AppError extends Error {
  readonly statusCode: number;
  readonly errors: ApiFieldError[] | undefined;

  constructor(statusCode: number, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, AppError);
  }
}

export const badRequest = (message: string, errors?: ApiFieldError[]) =>
  new AppError(400, message, errors);

export const unauthorized = (message = 'Authentication required') => new AppError(401, message);

export const forbidden = (message = 'You do not have access to this resource') =>
  new AppError(403, message);

export const notFound = (message = 'Resource not found') => new AppError(404, message);

export const conflict = (message: string) => new AppError(409, message);

export const unprocessable = (message: string, errors?: ApiFieldError[]) =>
  new AppError(422, message, errors);
