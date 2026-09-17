'use client';

import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface LogoutButtonProps {
  className?: string;
  variant?:
    'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | null | undefined;
}

function useLogout() {
  const router = useRouter(), [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await api.post('/auth/logout'); toast.success('Berhasil keluar'); router.push('/'); }
    catch { toast.error('Gagal keluar. Silakan coba lagi.'); setIsLoggingOut(false); }
  };
  return { isLoggingOut, handleLogout };
}

export function LogoutButton({ className, variant = 'outline' }: LogoutButtonProps) {
  const { isLoggingOut, handleLogout } = useLogout();
  return <Button variant={variant} className={className} onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? 'Keluar...' : 'Keluar'}</Button>;
}
