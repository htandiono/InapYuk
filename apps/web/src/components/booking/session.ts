/** Reads the login token from the cookie or local storage. */
export function readAccessToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const fromCookie = readCookie('accessToken');
  return fromCookie || window.localStorage.getItem('inapyuk.accessToken') || undefined;
}

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  const hit = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  return hit ? decodeURIComponent(hit.slice(prefix.length)) : undefined;
}

export function readSession(): { isVerified: boolean; role: string } | null {
  const token = readAccessToken();
  if (!token) return null;
  try {
    const raw = (token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(raw)) as {
      isVerified?: boolean;
      role?: string;
    };
    return { isVerified: Boolean(payload.isVerified), role: payload.role ?? 'USER' };
  } catch {
    return null;
  }
}
