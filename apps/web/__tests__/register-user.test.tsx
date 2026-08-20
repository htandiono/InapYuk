import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../src/app/(public)/register/page';
import { api, ApiError } from '../src/lib/api-client';
import { useRouter } from 'next/navigation';

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
}));

describe('User Registration Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders registration form', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/nama/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /daftar/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<RegisterPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /daftar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/nama wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/email wajib diisi/i)).toBeInTheDocument();
    });
    
    expect(api.post).not.toHaveBeenCalled();
  });

  it('submits form successfully and shows success state', async () => {
    const pushMock = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });

    render(<RegisterPage />);
    
    fireEvent.change(screen.getByLabelText(/nama/i), { target: { value: 'Budi' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'budi@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /daftar/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/register/user', {
        name: 'Budi',
        email: 'budi@example.com',
      });
      expect(screen.getByText(/silakan cek email kamu/i)).toBeInTheDocument();
    });
  });

  it('shows error from API', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(400, 'Email sudah terdaftar')
    );

    render(<RegisterPage />);
    
    fireEvent.change(screen.getByLabelText(/nama/i), { target: { value: 'Siti' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'siti@example.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /daftar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email sudah terdaftar/i)).toBeInTheDocument();
    });
  });
});
