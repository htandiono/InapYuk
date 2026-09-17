'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { clientEnv } from '@/lib/env';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

type SetStates = { setSuccess: (v: boolean) => void; setMessage: (v: string) => void; setRole: (v: string) => void; setLoading: (v: boolean) => void; };

const verifyEmailFn = async (token: string, isMounted: { current: boolean }, setStates: SetStates) => {
  const { setSuccess, setMessage, setRole, setLoading } = setStates;
  try {
    const res = await fetch(`${clientEnv.apiBaseUrl}/users/email/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    const data = await res.json();
    if (isMounted.current) {
      if (res.ok && data.success) { setSuccess(true); setMessage(data.message || 'Berhasil'); setRole(data.data?.role || 'USER'); }
      else setMessage(data.message || 'Gagal memverifikasi.');
    }
    if (res.ok && data.success) await fetch(`${clientEnv.apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  } catch { if (isMounted.current) setMessage('Server error'); } finally { if (isMounted.current) setLoading(false); }
};

function useVerifyEmail(token: string | null) {
  const [loading, setLoading] = useState(!!token), [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(token ? '' : 'Token tidak ditemukan.'), [role, setRole] = useState('USER');
  useEffect(() => {
    if (!token) return;
    const isMounted = { current: true };
    verifyEmailFn(token, isMounted, { setSuccess, setMessage, setRole, setLoading });
    return () => { isMounted.current = false; };
  }, [token]);
  return { loading, success, message, role };
}

function VerifyLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="text-center space-y-3"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /><p className="text-muted-foreground text-sm">Memverifikasi email Anda...</p></div>
    </div>
  );
}

function VerifyHeader({ success, message }: { success: boolean; message: string }) {
  return (
    <CardHeader className="space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {success ? <CheckCircle2 className="h-10 w-10 text-primary" /> : <XCircle className="h-10 w-10 text-destructive" />}
      </div>
      <CardTitle className="text-2xl font-bold">{success ? 'Email Berhasil Diubah' : 'Verifikasi Gagal'}</CardTitle>
      <CardDescription className="text-base text-muted-foreground">{message}</CardDescription>
    </CardHeader>
  );
}

function VerifyContentUI({ success, role }: { success: boolean; role: string }) {
  return (
    <CardContent>
      {success ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Sesi Anda sebelumnya telah diakhiri demi keamanan. Silakan masuk kembali menggunakan email baru Anda.</p>
          <Link href={role === 'TENANT' ? '/tenant/login' : '/login'} className={cn(buttonVariants({ variant: 'default' }), 'w-full')}>Masuk dengan Email Baru</Link>
        </div>
      ) : (
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>Kembali ke Beranda</Link>
      )}
    </CardContent>
  );
}

function VerifyEmailChangeContent() {
  const token = useSearchParams().get('token');
  const { loading, success, message, role } = useVerifyEmail(token);
  if (loading) return <VerifyLoading />;
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <VerifyHeader success={success} message={message} />
        <VerifyContentUI success={success} role={role} />
      </Card>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center p-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
