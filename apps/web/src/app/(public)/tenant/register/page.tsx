'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { RegisterFormValues, useTenantRegister } from './useTenantRegister';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Separator } from '@/components/ui/separator';

function SuccessView({ onResend, isResending, cooldown }: { onResend: () => void; isResending: boolean; cooldown: number; }) {
  const router = useRouter();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader><CardTitle className="text-2xl font-bold text-primary">Berhasil!</CardTitle><CardDescription>Pendaftaran berhasil. Silakan cek email kamu untuk link verifikasi.</CardDescription></CardHeader>
        <CardFooter className="flex flex-col gap-3 justify-center">
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">Kembali ke Beranda</Button>
          <Button onClick={onResend} variant="link" className="text-sm text-primary p-0 h-auto" disabled={isResending || cooldown > 0}>{isResending ? 'Mengirim...' : cooldown > 0 ? `Kirim ulang email (${cooldown}s)` : 'Belum menerima email? Kirim ulang'}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function RegisterTenantFormFields({ register, errors, isSubmitting }: { register: UseFormRegister<RegisterFormValues>; errors: FieldErrors<RegisterFormValues>; isSubmitting: boolean; }) {
  return (
    <>
      <div className="space-y-2"><Label htmlFor="name">Nama Lengkap</Label><Input id="name" placeholder="Tenant Bali" {...register('name')} disabled={isSubmitting} />{errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}</div>
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="bali@example.com" {...register('email')} disabled={isSubmitting} />{errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}</div>
      <div className="space-y-2"><Label htmlFor="companyName">Nama Perusahaan</Label><Input id="companyName" placeholder="PT Bali Villas" {...register('companyName')} disabled={isSubmitting} />{errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message as string}</p>}</div>
      <div className="space-y-2"><Label htmlFor="companyAddress">Alamat Perusahaan</Label><Input id="companyAddress" placeholder="Jl. Pantai Kuta No. 1" {...register('companyAddress')} disabled={isSubmitting} />{errors.companyAddress && <p className="text-sm text-destructive">{errors.companyAddress.message as string}</p>}</div>
    </>
  );
}

function RegisterTenantFormActions({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <>
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}</Button>
      <div className="mt-6 flex items-center space-x-2">
        <Separator className="flex-1" /><span className="text-xs text-muted-foreground uppercase tracking-wider">Atau daftar dengan</span><Separator className="flex-1" />
      </div>
      <div className="mt-6"><GoogleLoginButton role="TENANT" /></div>
      <div className="mt-4 text-center text-sm">Mencari penginapan? <Link href="/register" className="text-primary hover:underline">Daftar sebagai Tamu</Link></div>
    </>
  );
}

export default function RegisterTenantPage() {
  const { form: { register, handleSubmit, formState: { errors: err } }, isSubmitting: isSub, serverError: errSrv, success, cooldown, isResending, onSubmit, onResend } = useTenantRegister();
  if (success) return <SuccessView onResend={onResend} isResending={isResending} cooldown={cooldown} />;
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center text-center pb-2"><Logo isTenant className="mb-2 text-3xl" /><CardTitle className="text-xl font-bold">Daftar sebagai Tenant</CardTitle><CardDescription>Mulai kelola penginapan kamu</CardDescription></CardHeader>
        <CardContent><form onSubmit={handleSubmit(onSubmit)} className="space-y-4">{errSrv && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errSrv}</div>}<RegisterTenantFormFields register={register} errors={err} isSubmitting={isSub} /><RegisterTenantFormActions isSubmitting={isSub} /></form></CardContent>
      </Card>
    </div>
  );
}
