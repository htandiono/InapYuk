import { env, isProduction } from './env';

/** Share the login cookie between inapyuk.space and api.inapyuk.space. */
export function sharedCookieDomain(host: string, production: boolean): string | undefined {
  if (!production) return undefined;
  const parts = host.split('.');
  if (host === 'localhost' || parts.length < 2) return undefined;
  return `.${parts.slice(-2).join('.')}`;
}

function parentDomain(): string | undefined {
  return sharedCookieDomain(new URL(env.WEB_BASE_URL).hostname, isProduction);
}

const domain = parentDomain();

export const cookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/',
  ...(domain ? { domain } : {}),
};
