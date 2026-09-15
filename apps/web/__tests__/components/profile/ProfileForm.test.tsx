import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileForm } from '../../../src/components/profile/ProfileForm';
import { api } from '../../../src/lib/api-client';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../src/lib/api-client', () => ({
  api: {
    patch: vi.fn(),
  },
}));

describe('ProfileForm', () => {
  const mockUser = {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    avatarUrl: null,
    provider: 'EMAIL' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ProfileForm user={mockUser} />);
    expect(screen.getByDisplayValue('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByDisplayValue('budi@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simpan Perubahan/i })).toBeInTheDocument();
  });

  it('shows error when name is too short', async () => {
    render(<ProfileForm user={mockUser} />);
    const nameInput = screen.getByDisplayValue('Budi Santoso');
    
    fireEvent.change(nameInput, { target: { value: 'Bu' } });
    fireEvent.submit(screen.getByRole('button', { name: /Simpan Perubahan/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Nama minimal 3 karakter')).toBeInTheDocument();
    });
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('submits correctly', async () => {
    render(<ProfileForm user={mockUser} />);
    const nameInput = screen.getByDisplayValue('Budi Santoso');
    
    fireEvent.change(nameInput, { target: { value: 'Budi Updated' } });
    fireEvent.submit(screen.getByRole('button', { name: /Simpan Perubahan/i }));
    
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/users/profile', expect.any(FormData), expect.any(Object));
    });
  });
});
