import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterTenantPage from '../src/app/(public)/tenant/register/page';
import { api, ApiError } from '../src/lib/api-client';
import { useRouter } from 'next/navigation';

vi.mock('../src/lib/api-client', () => ({
  api: {
    post: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    fieldErrors: any[];
    constructor(status: number, message: string, fieldErrors: any[] = []) {
      super(message);
      this.status = status;
      this.fieldErrors = fieldErrors;
    }
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('Tenant Registration Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders tenant registration form', () => {
    render(<RegisterTenantPage />);
    expect(screen.getByText(/daftar sebagai tenant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nama lengkap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nama perusahaan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alamat perusahaan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /daftar/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<RegisterTenantPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /daftar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/nama wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/email wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/nama perusahaan wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/alamat perusahaan wajib diisi/i)).toBeInTheDocument();
    });
    
    expect(api.post).not.toHaveBeenCalled();
  });

  it('submits form successfully to tenant endpoint', async () => {
    const pushMock = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });

    render(<RegisterTenantPage />);
    
    fireEvent.change(screen.getByLabelText(/nama lengkap/i), { target: { value: 'Tenant Bali' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bali@example.com' } });
    fireEvent.change(screen.getByLabelText(/nama perusahaan/i), { target: { value: 'PT Bali Villas' } });
    fireEvent.change(screen.getByLabelText(/alamat perusahaan/i), { target: { value: 'Jl. Kuta No 1' } });
    
    fireEvent.click(screen.getByRole('button', { name: /daftar/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/register/tenant', {
        name: 'Tenant Bali',
        email: 'bali@example.com',
        companyName: 'PT Bali Villas',
        companyAddress: 'Jl. Kuta No 1',
      });
      expect(screen.getByText(/silakan cek email kamu/i)).toBeInTheDocument();
    });
  });

  it('shows error from API', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(400, 'Email sudah digunakan oleh user lain')
    );

    render(<RegisterTenantPage />);
    
    fireEvent.change(screen.getByLabelText(/nama lengkap/i), { target: { value: 'Tenant' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'tenant@example.com' } });
    fireEvent.change(screen.getByLabelText(/nama perusahaan/i), { target: { value: 'PT' } });
    fireEvent.change(screen.getByLabelText(/alamat perusahaan/i), { target: { value: 'Jl' } });
    
    fireEvent.click(screen.getByRole('button', { name: /daftar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email sudah digunakan/i)).toBeInTheDocument();
    });
  });
});
