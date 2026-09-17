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

const publicRoutes = [
  '/login', '/register', '/verify', '/resend-verification', '/email-change/verify',
  '/reset-password', '/reset-password/confirm', '/tenant/register', '/tenant/login',
  '/', '/properties', '/bantuan', '/privasi', '/syarat',
];
const authRoutes = ['/login', '/register', '/tenant/register', '/tenant/login'];
const globalSharedRoutes = ['/bantuan', '/privasi', '/syarat'];

function decodeToken(request: NextRequest): JwtPayload | null {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return null;
  try { return decodeJwt(token) as unknown as JwtPayload; } catch { return null; }
}

function redirectAuthRoute(role: UserRole, url: string): NextResponse {
  const dest = role === 'TENANT' ? '/tenant/properties' : '/';
  return NextResponse.redirect(new URL(dest, url));
}

function guardTenantAccess(role: UserRole, pathname: string, url: string): NextResponse | null {
  if (role === 'USER' && pathname.startsWith('/tenant'))
    return NextResponse.redirect(new URL('/', url));
  if (role === 'TENANT' && !pathname.startsWith('/tenant') && !globalSharedRoutes.includes(pathname))
    return NextResponse.redirect(new URL('/tenant/properties', url));
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const payload = decodeToken(request);
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/properties');
  const isAuthRoute = authRoutes.includes(pathname);

  if (!payload) {
    return isPublicRoute ? NextResponse.next() : NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute) return redirectAuthRoute(payload.role, request.url);
  const tenantGuard = guardTenantAccess(payload.role, pathname, request.url);
  return tenantGuard ?? NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|uploads|favicon.ico).*)',
  ],
};
