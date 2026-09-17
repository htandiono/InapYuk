'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
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
import Link from 'next/link';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email wajib diisi').max(255, 'Email terlalu panjang').email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function useTenantLoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false), [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true); setServerError(null);
    try {
      const res = await api.post<{ role: string }>('/auth/login', { ...data, role: 'TENANT' });
      router.push(res.role === 'TENANT' ? '/tenant/properties' : '/');
    } catch (err) { setServerError(err instanceof ApiError ? err.message : 'Terjadi kesalahan.'); setIsSubmitting(false); }
  };
  return { ...form, isSubmitting, serverError, onSubmit: form.handleSubmit(onSubmit) };
}

type TProps = { register: UseFormRegister<LoginFormValues>; errors: FieldErrors<LoginFormValues>; isSubmitting: boolean };
function TenantLoginFormFields({ register, errors: err, isSubmitting }: TProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="budi@example.com" {...register('email')} disabled={isSubmitting} />
        {err.email && <p className="text-sm text-destructive">{err.email.message as string}</p>}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link href="/reset-password" className="text-sm text-primary hover:underline" tabIndex={-1}>Lupa password?</Link></div>
        <PasswordInput id="password" placeholder="Masukkan password" {...register('password')} disabled={isSubmitting} />
        {err.password && <p className="text-sm text-destructive">{err.password.message as string}</p>}
      </div>
    </>
  );
}

function TenantLoginFormActions({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <>
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Masuk'}</Button>
      <div className="mt-6 flex items-center space-x-2">
        <Separator className="flex-1" /><span className="text-xs text-muted-foreground uppercase tracking-wider">ATAU MASUK DENGAN</span><Separator className="flex-1" />
      </div>
      <div className="mt-6"><GoogleLoginButton role="TENANT" /></div>
    </>
  );
}

export default function TenantLoginPage() {
  const { register, formState: { errors: err }, isSubmitting, serverError, onSubmit } = useTenantLoginForm();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center text-center pb-2"><Logo isTenant className="mb-2 text-3xl" /><CardTitle className="text-xl font-bold">Masuk sebagai Tenant</CardTitle><CardDescription>Kelola properti dan pesanan kamu</CardDescription></CardHeader>
        <CardContent><form onSubmit={onSubmit} className="space-y-4">{serverError && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{serverError}</div>}<TenantLoginFormFields register={register} errors={err} isSubmitting={isSubmitting} /><TenantLoginFormActions isSubmitting={isSubmitting} /></form></CardContent>
        <CardFooter className="justify-center"><div className="text-center text-sm text-muted-foreground">Belum punya akun Tenant? <Link href="/tenant/register" className="text-primary hover:underline">Daftar sebagai Tenant</Link></div></CardFooter>
      </Card>
    </div>
  );
}
