'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/api/auth/logout');
      toast.success('Berhasil keluar');
      router.push('/login');
    } catch (error) {
      toast.error('Gagal keluar. Silakan coba lagi.');
      setIsLoggingOut(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout} 
      disabled={isLoggingOut}
    >
      {isLoggingOut ? 'Keluar...' : 'Keluar'}
    </Button>
  );
}
