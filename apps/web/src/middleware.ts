import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
import type { UserRole } from '@inapyuk/types';

interface JwtPayload {
  sub: string;
  role: UserRole;
  isVerified: boolean;
  email: string;
}

const publicRoutes = ['/login', '/register', '/verify', '/resend-verification', '/tenant/register', '/tenant/login', '/', '/properties', '/bantuan', '/privasi', '/syarat'];
const authRoutes = ['/login', '/register', '/tenant/register', '/tenant/login'];
const globalSharedRoutes = ['/bantuan', '/privasi', '/syarat'];

function decodeToken(token: string): JwtPayload | null {
  try {
    return decodeJwt(token) as unknown as JwtPayload;
  } catch {
    return null;
  }
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname) || pathname.startsWith('/properties');
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.includes(pathname);
}

function isTenantRoute(pathname: string): boolean {
  return pathname.startsWith('/tenant');
}

function isGlobalSharedRoute(pathname: string): boolean {
  return globalSharedRoutes.includes(pathname);
}

function redirectUnauthenticatedUser(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/login', request.url));
}

function redirectAuthenticatedUser(request: NextRequest, role: UserRole): NextResponse {
  if (role === 'TENANT') {
    return NextResponse.redirect(new URL('/tenant/properties', request.url));
  }
  return NextResponse.redirect(new URL('/', request.url));
}

function handleRoleSeparation(request: NextRequest, role: UserRole): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (role === 'USER' && isTenantRoute(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (role === 'TENANT' && !isTenantRoute(pathname) && !isGlobalSharedRoute(pathname)) {
    return NextResponse.redirect(new URL('/tenant/properties', request.url));
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const payload = token ? decodeToken(token) : null;

  if (!payload) {
    return isPublicRoute(pathname) ? NextResponse.next() : redirectUnauthenticatedUser(request);
  }

  if (isAuthRoute(pathname)) {
    return redirectAuthenticatedUser(request, payload.role);
  }

  return handleRoleSeparation(request, payload.role) || NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|uploads|favicon.ico).*)'],
};
