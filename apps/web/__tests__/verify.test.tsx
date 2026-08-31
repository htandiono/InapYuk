import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyPage from '../src/app/(public)/verify/page';
import { api, ApiError } from '../src/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';

vi.mock('../src/lib/api-client', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
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
    vi.mocked(api.get).mockResolvedValue({ success: true });
  });

  it('shows error if token is missing', () => {
    vi.mocked(useSearchParams).mockReturnValue({ get: () => null } as unknown as ReturnType<typeof useSearchParams>);
    render(<VerifyPage />);
    expect(screen.getByText(/link verifikasi tidak valid/i)).toBeInTheDocument();
  });

  it('renders set password form if token is present', async () => {
    vi.mocked(useSearchParams).mockReturnValue({ get: () => 'valid-token' } as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.get).mockResolvedValueOnce({ success: true });
    render(<VerifyPage />);
    const passwordInput = await screen.findByLabelText(/password baru/i);
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verifikasi/i })).toBeInTheDocument();
  });

  it('shows validation errors for short password', async () => {
    vi.mocked(useSearchParams).mockReturnValue({ get: () => 'valid-token' } as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.get).mockResolvedValueOnce({ success: true });
    render(<VerifyPage />);
    
    const passwordInput = await screen.findByLabelText(/password baru/i);
    fireEvent.change(passwordInput, { target: { value: 'short' } });
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
    vi.mocked(api.get).mockResolvedValueOnce({ success: true });
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });

    render(<VerifyPage />);
    
    const passwordInput = await screen.findByLabelText(/password baru/i);
    fireEvent.change(passwordInput, { target: { value: 'StrongP@ssw0rd!' } });
    fireEvent.change(screen.getByLabelText(/konfirmasi password/i), { target: { value: 'StrongP@ssw0rd!' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/verify', {
        token: 'valid-token',
        password: 'StrongP@ssw0rd!',
        confirmPassword: 'StrongP@ssw0rd!',
      });
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error from API on invalid token', async () => {
    vi.mocked(useSearchParams).mockReturnValue({ get: () => 'invalid-token' } as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(api.get).mockResolvedValueOnce({ success: true });
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(400, 'Token tidak valid atau sudah kadaluarsa')
    );

    render(<VerifyPage />);
    
    const passwordInput = await screen.findByLabelText(/password baru/i);
    fireEvent.change(passwordInput, { target: { value: 'StrongP@ssw0rd!' } });
    fireEvent.change(screen.getByLabelText(/konfirmasi password/i), { target: { value: 'StrongP@ssw0rd!' } });
    fireEvent.click(screen.getByRole('button', { name: /verifikasi/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/token tidak valid/i)).toBeInTheDocument();
    });
  });
});
