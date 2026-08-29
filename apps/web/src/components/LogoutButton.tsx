'use client';

import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
      toast.success('Berhasil keluar');
      router.push('/');
    } catch {
      toast.error('Gagal keluar. Silakan coba lagi.');
      setIsLoggingOut(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Keluar...' : 'Keluar'}
    </Button>
  );
}
