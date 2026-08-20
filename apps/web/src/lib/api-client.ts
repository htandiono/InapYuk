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
  /** Internal flag to prevent infinite refresh loops */
  _retry?: boolean;
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

// Keep track of refresh promise to avoid multiple simultaneous refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${clientEnv.apiBaseUrl}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then(async (res) => {
      if (res.ok) {
        const payload = await res.json().catch(() => null);
        return payload?.success === true;
      }
      return false;
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Single entry point for every API call. Unwraps the shared ApiResponse
 * envelope so callers get `data` directly and failures throw ApiError.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, revalidate, headers, _retry, ...rest } = options;

  const response = await fetch(`${clientEnv.apiBaseUrl}${path}`, {
    ...rest,
    credentials: 'include',
    headers: buildHeaders(body, token, headers),
    body: serialiseBody(body),
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload || payload.success === false) {
    // Silent Refresh Interceptor
    if (response.status === 401 && !_retry && path !== '/api/auth/refresh') {
      const refreshed = await attemptRefresh();
      if (refreshed) {
        // Retry original request
        return apiFetch<T>(path, { ...options, _retry: true });
      }
    }

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
