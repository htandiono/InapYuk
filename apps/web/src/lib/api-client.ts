import type { ApiResponse } from '@inapyuk/types';
import { clientEnv } from './env';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: { path: string; message: string }[];

  constructor(
    status: number,
    message: string,
    fieldErrors: { path: string; message: string }[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
  /** Passed through to Next's extended fetch for ISR on server components. */
  revalidate?: number;
}

function buildHeaders(body: unknown, token?: string, extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  return { ...headers, ...(extra as Record<string, string>) };
}

function serialiseBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

/**
 * Single entry point for every API call. Unwraps the shared ApiResponse
 * envelope so callers get `data` directly and failures throw ApiError.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, revalidate, headers, ...rest } = options;

  const response = await fetch(`${clientEnv.apiBaseUrl}${path}`, {
    ...rest,
    headers: buildHeaders(body, token, headers),
    body: serialiseBody(body),
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload || payload.success === false) {
    const message = payload && !payload.success ? payload.message : response.statusText;
    const errors = payload && !payload.success ? (payload.errors ?? []) : [];
    throw new ApiError(response.status, message || 'Request failed', errors);
  }

  return payload.data;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
