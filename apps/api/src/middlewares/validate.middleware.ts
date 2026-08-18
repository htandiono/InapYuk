import type { RequestHandler } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import type { ApiFieldError } from '@inapyuk/types';
import { unprocessable } from '../utils/app-error';

type Source = 'body' | 'query' | 'params';

function toFieldErrors(error: ZodError): ApiFieldError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

/**
 * Validates and replaces the request segment with the parsed value, so
 * handlers receive coerced types (numbers, dates, booleans) rather than
 * raw strings.
 */
export function validate(schema: ZodTypeAny, source: Source = 'body'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(unprocessable('Validation failed', toFieldErrors(result.error)));
      return;
    }
    Object.defineProperty(req, source, { value: result.data, writable: true });
    next();
  };
}

export const validateBody = (schema: ZodTypeAny) => validate(schema, 'body');
export const validateQuery = (schema: ZodTypeAny) => validate(schema, 'query');
export const validateParams = (schema: ZodTypeAny) => validate(schema, 'params');
