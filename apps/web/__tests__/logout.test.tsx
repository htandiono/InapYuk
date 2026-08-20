import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from '../src/components/LogoutButton';
import { api } from '../src/lib/api-client';
import { useRouter } from 'next/navigation';

vi.mock('../src/lib/api-client', () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('Logout Button', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders logout button', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /keluar/i })).toBeInTheDocument();
  });

  it('calls logout API and redirects to login on click', async () => {
    const pushMock = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });

    render(<LogoutButton />);
    
    fireEvent.click(screen.getByRole('button', { name: /keluar/i }));
    
    expect(screen.getByRole('button', { name: /keluar/i })).toBeDisabled();
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });
});
