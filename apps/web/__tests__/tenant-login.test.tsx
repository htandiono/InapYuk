import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TenantLoginPage from '../src/app/(public)/tenant/login/page';
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

describe('Tenant Login Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders tenant login form', () => {
    render(<TenantLoginPage />);
    expect(screen.getByText(/masuk sebagai tenant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<TenantLoginPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/password wajib diisi/i)).toBeInTheDocument();
    });
    
    expect(api.post).not.toHaveBeenCalled();
  });

  it('submits form successfully and redirects USER to homepage', async () => {
    const pushMock = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
    vi.mocked(api.post).mockResolvedValueOnce({
      role: 'USER'
    });

    render(<TenantLoginPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'user@example.com',
        password: 'password123',
        role: 'TENANT',
      });
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('submits form successfully and redirects TENANT to /tenant/properties', async () => {
    const pushMock = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
    vi.mocked(api.post).mockResolvedValueOnce({
      role: 'TENANT'
    });

    render(<TenantLoginPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'tenant@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'tenant@example.com',
        password: 'password123',
        role: 'TENANT',
      });
      expect(pushMock).toHaveBeenCalledWith('/tenant/properties');
    });
  });

  it('shows error from API on invalid credentials', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new ApiError(401, 'Email atau password salah')
    );

    render(<TenantLoginPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'wrong@example.com',
        password: 'wrongpass',
        role: 'TENANT',
      });
      expect(screen.getByText(/email atau password salah/i)).toBeInTheDocument();
    });
  });
});
