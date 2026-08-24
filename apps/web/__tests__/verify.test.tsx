import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyPage from '../src/app/(public)/verify/page';
import { api, ApiError } from '../src/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';

vi.mock('../src/lib/api-client', () => ({
  api: {
    post: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    fieldErrors: unknown[];
    constructor(status: number, message: string, fieldErrors: unknown[] = []) {
      super(message);
      this.status = status;
      this.fieldErrors = fieldErrors;
    }
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('Verify Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows error if token is missing', () => {
    vi.mocked(useSearchParams).mockReturnValue({ get: () => null } as unknown as ReturnType<typeof useSearchParams>);
    render(<VerifyPage />);
    expect(screen.getByText(/link verifikasi tidak valid/i)).toBeInTheDocument();
  });

  it('renders set password form if token is present', () => {
    vi.mocked(useSearchParams).mockReturnValue({ get: () => 'valid-token' } as unknown as ReturnType<typeof useSearchParams>);
    render(<VerifyPage />);
    expect(screen.getByLabelText(/password baru/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verifikasi/i })).toBeInTheDocument();
  });

  it('shows validation errors for short password', async () => {
    vi.mocked(useSearchParams).mockReturnValue({ get: () => 'valid-token' } as unknown as ReturnType<typeof useSearchParams>);
    render(<VerifyPage />);
    
    fireEvent.change(screen.getByLabelText(/password baru/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/minimal 8 karakter/i)).toBeInTheDocument();
    });
    
    expect(api.post).not.toHaveBeenCalled();
  });

  it('submits successfully and redirects to login', async () => {
    const pushMock = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue({ get: () => 'valid-token' } as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });

    render(<VerifyPage />);
    
    fireEvent.change(screen.getByLabelText(/password baru/i), { target: { value: 'strongpassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/verify', {
        token: 'valid-token',
        password: 'strongpassword123',
      });
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error from API on invalid token', async () => {
    vi.mocked(useSearchParams).mockReturnValue({ get: () => 'invalid-token' } as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(400, 'Token tidak valid atau sudah kadaluarsa')
    );

    render(<VerifyPage />);
    
    fireEvent.change(screen.getByLabelText(/password baru/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/token tidak valid/i)).toBeInTheDocument();
    });
  });
});
