import { isProduction } from './env';

export const cookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
};
