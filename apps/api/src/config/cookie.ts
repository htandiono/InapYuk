import { env, isProduction } from './env';

/** Share the login cookie between inapyuk.space and api.inapyuk.space. */
function parentDomain(): string | undefined {
  if (!isProduction) return undefined;
  const host = new URL(env.WEB_BASE_URL).hostname;
  const parts = host.split('.');
  if (host === 'localhost' || parts.length < 2) return undefined;
  return `.${parts.slice(-2).join('.')}`;
}

const domain = parentDomain();

export const cookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/',
  ...(domain ? { domain } : {}),
};
