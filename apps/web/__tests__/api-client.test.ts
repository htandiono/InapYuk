import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, ApiError } from '../src/lib/api-client';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should include credentials in all requests', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { test: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await apiFetch('/test');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: 'include',
      })
    );
  });

  it('should transparently retry a request once if it fails with 401 and refresh succeeds', async () => {
    // 1st call to /test fails with 401
    // 2nd call to /auth/refresh succeeds with 200
    // 3rd call to /test succeeds with 200
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { success: true } }), { status: 200 })
      );

    const result = await apiFetch('/test');

    expect(result).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    
    // First call
    expect(fetchSpy.mock.calls[0][0]).toContain('/test');
    
    // Second call is the refresh
    expect(fetchSpy.mock.calls[1][0]).toContain('/api/auth/refresh');
    expect(fetchSpy.mock.calls[1][1]).toMatchObject({ method: 'POST' });
    
    // Third call is the retry
    expect(fetchSpy.mock.calls[2][0]).toContain('/test');
  });

  it('should throw ApiError if refresh fails', async () => {
    // 1st call to /test fails with 401
    // 2nd call to /auth/refresh fails with 401
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, message: 'Session Expired' }), { status: 401 })
      );

    await expect(apiFetch('/test')).rejects.toThrow(ApiError);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
