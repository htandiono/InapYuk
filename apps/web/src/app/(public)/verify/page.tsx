'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import { VerifyForm } from './VerifyForm';

function useVerifyCheck() {
  const searchParams = useSearchParams(), token = searchParams.get('token');
  const [isChecking, setIsChecking] = useState(!!token), [checkError, setCheckError] = useState<string | null>(null);
  useEffect(() => {
    if (token) api.get(`/auth/verify/check?token=${token}`).catch(() => setCheckError('Link verifikasi tidak valid.')).finally(() => setIsChecking(false));
  }, [token]);
  return { token, isChecking, checkError, isVerified: checkError === 'Akun ini sudah diverifikasi sebelumnya' };
}

function InvalidLinkView({ isVerified, checkError }: { isVerified: boolean; checkError: string | null }) {
  const router = useRouter();
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-destructive">{isVerified ? 'Sudah Diverifikasi' : 'Link Tidak Valid'}</CardTitle>
        <CardDescription>{isVerified ? 'User telah berhasil diverifikasi sebelumnya. Silakan menuju halaman login.' : checkError || 'Link verifikasi tidak valid atau tidak lengkap.'}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        {isVerified ? <Button className="w-full" onClick={() => router.push('/login')}>Menuju halaman Login</Button> : <Link href="/resend-verification" className="text-primary hover:underline text-sm">Kirim ulang link verifikasi</Link>}
      </CardFooter>
    </Card>
  );
}

function VerifyPageInner() {
  const { token, isChecking, checkError, isVerified } = useVerifyCheck();
  if (isChecking) return <Card className="w-full max-w-md p-8 flex justify-center items-center"><p className="text-muted-foreground">Memeriksa link verifikasi...</p></Card>;
  if (!token || checkError) return <InvalidLinkView isVerified={isVerified} checkError={checkError} />;
  return <VerifyForm token={token} />;
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={<div>Memuat...</div>}>
        <VerifyPageInner />
      </Suspense>
    </div>
  );
}
