import jwt, { type SignOptions } from 'jsonwebtoken';
import type { AuthTokens, JwtPayload } from '@inapyuk/types';
import { env } from '../config/env';
import { unauthorized } from '../utils/app-error';

type Expiry = SignOptions['expiresIn'];

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as Expiry,
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as Expiry,
  });
}

export function issueTokens(payload: JwtPayload): AuthTokens {
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw unauthorized('Access token is invalid or has expired');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw unauthorized('Refresh token is invalid or has expired');
  }
}
