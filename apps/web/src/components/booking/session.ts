'use client';

import { useSyncExternalStore } from 'react';

/** Reads the login token from the cookie or local storage. */
export function readAccessToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return readCookie('sessionHint') || readCookie('accessToken') || undefined;
}

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  const hit = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  return hit ? decodeURIComponent(hit.slice(prefix.length)) : undefined;
}

export function readSession(): { isVerified: boolean; role: string } | null {
  const token = readAccessToken();
  if (!token) return null;
  if (token.includes(':')) return decodeHint(token);
  return decodeSession(token);
}

function decodeHint(hint: string): { isVerified: boolean; role: string } {
  const [role, verified] = hint.split(':');
  return { role: role || 'USER', isVerified: verified === '1' };
}

function decodeSession(token: string): { isVerified: boolean; role: string } | null {
  try {
    const raw = (token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(raw)) as { isVerified?: boolean; role?: string };
    return { isVerified: Boolean(payload.isVerified), role: payload.role ?? 'USER' };
  } catch {
    return null;
  }
}

function subscribeSession(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

/** Same on the server and during the first paint, then picks up the real token. */
export function useSession() {
  const token = useSyncExternalStore(
    subscribeSession,
    () => readAccessToken() ?? '',
    () => '',
  );
  if (!token) return null;
  return decodeSession(token);
}
