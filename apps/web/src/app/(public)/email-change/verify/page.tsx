import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { clientEnv } from '@/lib/env';
import { cn } from '@/lib/utils';

export default async function VerifyEmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/');
  }

  let success = false;
  let message = '';

  try {
    const res = await fetch(`${clientEnv.apiBaseUrl}/users/email/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    const data = await res.json();
    if (res.ok && data.success) {
      success = true;
      message = data.message || 'Email berhasil diperbarui.';
    } else {
      message = data.message || 'Gagal memverifikasi email.';
    }
  } catch {
    message = 'Terjadi kesalahan pada server.';
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {success ? (
              <CheckCircle2 className="h-10 w-10 text-primary" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {success ? 'Email Berhasil Diubah' : 'Verifikasi Gagal'}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <p className="text-sm">
                Status akun Anda sekarang sudah kembali terverifikasi. Anda dapat melanjutkan
                aktivitas.
              </p>
              <Link
                href="/profile"
                className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
              >
                Kembali ke Profil
              </Link>
            </div>
          ) : (
            <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
              Kembali ke Beranda
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
