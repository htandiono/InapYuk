import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarUpload } from '../../../src/components/profile/AvatarUpload';

describe('AvatarUpload', () => {
  const mockOnFileSelect = vi.fn();
  let alertMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    URL.createObjectURL = vi.fn(() => 'mock-url');
  });

  it('renders correctly with initials', () => {
    render(<AvatarUpload name="Budi Santoso" onFileSelect={mockOnFileSelect} />);
    expect(screen.getByText('BS')).toBeInTheDocument();
  });

  it('rejects file larger than 1MB', () => {
    render(<AvatarUpload name="Budi" onFileSelect={mockOnFileSelect} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create a 2MB file
    const file = new File(['x'.repeat(2 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(alertMock).toHaveBeenCalledWith('Ukuran file maksimal 1MB');
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('rejects unsupported file types', () => {
    render(<AvatarUpload name="Budi" onFileSelect={mockOnFileSelect} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(alertMock).toHaveBeenCalledWith('Format file tidak didukung');
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('accepts valid image', () => {
    render(<AvatarUpload name="Budi" onFileSelect={mockOnFileSelect} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file = new File(['content'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(alertMock).not.toHaveBeenCalled();
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });
});
