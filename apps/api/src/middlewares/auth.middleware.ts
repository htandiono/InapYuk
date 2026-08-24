import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { UserRole } from '@inapyuk/types';
import { verifyAccessToken } from '../libs/jwt';
import { prisma } from '../libs/prisma';
import { forbidden, unauthorized } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';

function readAccessToken(req: Request): string | null {
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/** Rejects the request unless a valid access token is present. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = readAccessToken(req);
  if (!token) throw unauthorized('Missing access token');
  req.user = verifyAccessToken(token);
  next();
}

/** Attaches the user when a token is present but never rejects. */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = readAccessToken(req);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // An expired token on a public route should not break the response.
    }
  }
  next();
}

/**
 * A tenant account must not reach user-only routes and vice versa - the spec
 * calls this out explicitly as a key point.
 */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) {
      throw forbidden('Akses ditolak');
    }
    next();
  };
}

/** Unverified accounts may browse but may not transact. */
export function requireVerified(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw unauthorized();
  if (!req.user.isVerified) {
    throw forbidden('Akun belum diverifikasi');
  }
  next();
}

/**
 * Resolves the caller's TenantProfile so tenant routes can scope every query
 * to their own properties.
 */
export const requireTenant: RequestHandler = asyncHandler(async (req, _res, next) => {
  if (!req.user) throw unauthorized();
  if (req.user.role !== 'TENANT') throw forbidden('Tenant account required');

  const profile = await prisma.tenantProfile.findUnique({
    where: { userId: req.user.sub },
    select: { id: true },
  });
  if (!profile) throw forbidden('Tenant profile has not been set up');

  req.tenantId = profile.id;
  next();
});
