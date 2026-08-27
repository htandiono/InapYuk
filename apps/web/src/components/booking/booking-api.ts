import { api, type RequestOptions } from '@/lib/api-client';
import { readAccessToken } from './session';

function authOptions(extra?: RequestOptions): RequestOptions {
  return { ...extra, token: readAccessToken(), credentials: 'include' };
}

/** Turns `{ status: 'PROCESSED' }` into `?status=PROCESSED`, skipping blanks. */
export function withQuery(
  path: string,
  query: Record<string, string | number | undefined | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function bookingGet<T>(path: string) {
  return api.get<T>(path, authOptions());
}

export function bookingPost<T>(path: string, body?: unknown) {
  return api.post<T>(path, body, authOptions());
}

export function bookingPatch<T>(path: string, body?: unknown) {
  return api.patch<T>(path, body, authOptions());
}

export function bookingUpload<T>(path: string, file: File) {
  const body = new FormData();
  body.append('proof', file);
  return api.post<T>(path, body, authOptions());
}
