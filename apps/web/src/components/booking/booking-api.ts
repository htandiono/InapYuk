import { api, type RequestOptions } from '@/lib/api-client';
import { readAccessToken } from './session';

function authOptions(extra?: RequestOptions): RequestOptions {
  return { ...extra, token: readAccessToken(), credentials: 'include' };
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
