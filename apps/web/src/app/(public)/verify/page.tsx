'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import { VerifyForm } from './VerifyForm';

function VerifyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isChecking, setIsChecking] = useState(!!token);
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get(`/auth/verify/check?token=${token}`)
      .catch(() => setCheckError('Link verifikasi tidak valid.'))
      .finally(() => setIsChecking(false));
  }, [token]);

  if (isChecking) {
    return (
      <Card className="w-full max-w-md p-8 flex justify-center items-center">
        <p className="text-muted-foreground">Memeriksa link verifikasi...</p>
      </Card>
    );
  }

  if (!token || checkError) {
    const isVerified = checkError === 'Akun ini sudah diverifikasi sebelumnya';
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-destructive">
            {isVerified ? 'Sudah Diverifikasi' : 'Link Tidak Valid'}
          </CardTitle>
          <CardDescription>
            {isVerified
              ? 'User telah berhasil diverifikasi sebelumnya. Silakan menuju halaman login.'
              : checkError || 'Link verifikasi tidak valid atau tidak lengkap.'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          {isVerified ? (
            <Button className="w-full" onClick={() => router.push('/login')}>
              Menuju halaman Login
            </Button>
          ) : (
            <Link href="/resend-verification" className="text-primary hover:underline text-sm">
              Kirim ulang link verifikasi
            </Link>
          )}
        </CardFooter>
      </Card>
    );
  }

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
