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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // 1. Decode token if present
  let payload: JwtPayload | null = null;
  if (token) {
    try {
      payload = decodeJwt(token) as unknown as JwtPayload;
    } catch {
      // Invalid token, ignore
    }
  }

  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/properties');
  const isAuthRoute = authRoutes.includes(pathname);

  // 2. Unauthenticated User Logic
  if (!payload) {
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 3. Authenticated User Logic
  const role = payload.role;

  // Prevent authenticated users from visiting login/register pages
  if (isAuthRoute) {
    if (role === 'TENANT') {
      return NextResponse.redirect(new URL('/tenant/properties', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Role Separation Logic
  const isTenantRoute = pathname.startsWith('/tenant');

  if (role === 'USER' && isTenantRoute) {
    // Users cannot access tenant routes
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (role === 'TENANT' && !isTenantRoute) {
    // Tenants cannot access user-specific routes (e.g., /profile) or the consumer homepage (/).
    // They can only access /tenant/* routes.
    // The ticket says: "Given a TENANT, When accessing user-only routes, Then redirected to /tenant/properties"
    return NextResponse.redirect(new URL('/tenant/properties', request.url));
  }

  return NextResponse.next();
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
