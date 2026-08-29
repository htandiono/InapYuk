import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import * as jose from 'jose';

vi.mock('jose', () => ({
  decodeJwt: vi.fn(),
}));

describe('middleware', () => {
  const createRequest = (pathname: string, token?: string) => {
    const req = new NextRequest(`http://localhost:3000${pathname}`);
    if (token) {
      req.cookies.set('accessToken', token);
    }
    return req;
  };

  it('redirects unauthenticated users to /login from protected routes', () => {
    const req = createRequest('/profile');
    const res = middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('allows unauthenticated users to visit public routes', () => {
    const req = createRequest('/login');
    const res = middleware(req);
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirects authenticated users away from auth routes', () => {
    vi.mocked(jose.decodeJwt).mockReturnValueOnce({ role: 'USER' });
    const req = createRequest('/login', 'valid-token');
    const res = middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('redirects authenticated tenants away from auth routes to /tenant/properties', () => {
    vi.mocked(jose.decodeJwt).mockReturnValueOnce({ role: 'TENANT' });
    const req = createRequest('/login', 'valid-token');
    const res = middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3000/tenant/properties');
  });

  it('redirects USER attempting to access TENANT routes to /', () => {
    vi.mocked(jose.decodeJwt).mockReturnValueOnce({ role: 'USER' });
    const req = createRequest('/tenant/properties', 'valid-token');
    const res = middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('allows TENANT to access TENANT routes', () => {
    vi.mocked(jose.decodeJwt).mockReturnValueOnce({ role: 'TENANT' });
    const req = createRequest('/tenant/properties', 'valid-token');
    const res = middleware(req);
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirects TENANT attempting to access USER routes to /tenant/properties', () => {
    vi.mocked(jose.decodeJwt).mockReturnValueOnce({ role: 'TENANT' });
    const req = createRequest('/profile', 'valid-token');
    const res = middleware(req);
    expect(res.headers.get('location')).toBe('http://localhost:3000/tenant/properties');
  });
});
