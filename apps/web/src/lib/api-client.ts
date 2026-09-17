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

function buildFetchOptions({ body, token, revalidate, headers, ...rest }: RequestOptions): RequestInit {
  return {
    ...rest,
    credentials: 'include' as RequestCredentials,
    headers: buildHeaders(body, token, headers),
    body: serialiseBody(body),
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  };
}

function parseApiError<T>(response: Response, payload: ApiResponse<T> | null): ApiError {
  const message = payload && !payload.success ? payload.message : response.statusText;
  const errors = payload && !payload.success ? (payload.errors ?? []) : [];
  return new ApiError(response.status, message || 'Request failed', errors);
}

// Keep track of refresh promise to avoid multiple simultaneous refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${clientEnv.apiBaseUrl}/auth/refresh`, {
    method: 'POST', credentials: 'include', headers: { Accept: 'application/json' },
  })
    .then(async (res) => {
      const p = await res.json().catch(() => null);
      return res.ok && p?.success === true;
    })
    .catch(() => false)
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function retryAfterRefresh<T>(path: string, options: RequestOptions): Promise<T | null> {
  if (options._retry || path === '/auth/refresh') return null;
  const refreshed = await attemptRefresh();
  if (refreshed) return apiFetch<T>(path, { ...options, _retry: true });
  return null;
}

/**
 * Single entry point for every API call. Unwraps the shared ApiResponse
 * envelope so callers get `data` directly and failures throw ApiError.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${clientEnv.apiBaseUrl}${path}`, buildFetchOptions(options));
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload || payload.success === false) {
    if (response.status === 401) {
      const retry = await retryAfterRefresh<T>(path, options);
      if (retry !== null) return retry;
    }
    throw parseApiError(response, payload);
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
