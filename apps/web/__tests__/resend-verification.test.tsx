import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResendVerificationPage from '../src/app/(public)/resend-verification/page';
import { api, ApiError } from '../src/lib/api-client';

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

describe('Resend Verification Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders resend verification form', () => {
    render(<ResendVerificationPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim ulang/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty email', async () => {
    render(<ResendVerificationPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /kirim ulang/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email wajib diisi/i)).toBeInTheDocument();
    });
    
    expect(api.post).not.toHaveBeenCalled();
  });

  it('submits successfully and shows success state', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });

    render(<ResendVerificationPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /kirim ulang/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/resend-verification', {
        email: 'user@example.com',
      });
      expect(screen.getByText(/berhasil terkirim/i)).toBeInTheDocument();
    });
  });

  it('shows error from API on failure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(400, 'Terlalu banyak permintaan')
    );

    render(<ResendVerificationPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /kirim ulang/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/terlalu banyak permintaan/i)).toBeInTheDocument();
    });
  });
});
