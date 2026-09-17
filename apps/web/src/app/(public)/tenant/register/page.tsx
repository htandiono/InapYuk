'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTenantRegister } from './useTenantRegister';

function SuccessView({ onResend, isResending, cooldown }: { onResend: () => void, isResending: boolean, cooldown: number }) {
  const router = useRouter();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Berhasil!</CardTitle>
          <CardDescription>Pendaftaran berhasil. Silakan cek email kamu untuk link verifikasi.</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 justify-center">
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">Kembali ke Beranda</Button>
          <Button onClick={onResend} variant="link" className="text-sm text-primary p-0 h-auto" disabled={isResending || cooldown > 0}>
            {isResending ? 'Mengirim...' : cooldown > 0 ? `Kirim ulang email (${cooldown}s)` : 'Belum menerima email? Kirim ulang'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterTenantPage() {
  const { form, isSubmitting, serverError, success, cooldown, isResending, onSubmit, onResend } = useTenantRegister();
  const { register, handleSubmit, formState: { errors } } = form;

  if (success) {
    return <SuccessView onResend={onResend} isResending={isResending} cooldown={cooldown} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-heading text-primary">Daftar sebagai Tenant</CardTitle>
          <CardDescription>Mulai kelola penginapan kamu dengan InapYuk</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{serverError}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" placeholder="Tenant Bali" {...register('name')} disabled={isSubmitting} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="bali@example.com" {...register('email')} disabled={isSubmitting} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nama Perusahaan</Label>
              <Input id="companyName" placeholder="PT Bali Villas" {...register('companyName')} disabled={isSubmitting} />
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Alamat Perusahaan</Label>
              <Input id="companyAddress" placeholder="Jl. Pantai Kuta No. 1" {...register('companyAddress')} disabled={isSubmitting} />
              {errors.companyAddress && <p className="text-sm text-destructive">{errors.companyAddress.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>

            <div className="mt-4 text-center text-sm">
              Mencari penginapan?{' '}
              <Link href="/register" className="text-primary hover:underline">Daftar sebagai Tamu</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
