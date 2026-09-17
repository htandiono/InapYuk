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
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Separator } from '@/components/ui/separator';
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

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email wajib diisi').max(255, 'Email terlalu panjang').email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function useLoginForm() {
  const router = useRouter(), [isSubmitting, setIsSubmitting] = useState(false), [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true); setServerError(null);
    try {
      const res = await api.post<{ role: string }>('/auth/login', { ...data, role: 'USER' });
      router.push(res.role === 'TENANT' ? '/tenant/properties' : '/');
    } catch (err) { setServerError(err instanceof ApiError ? err.message : 'Terjadi kesalahan yang tidak diketahui.'); setIsSubmitting(false); }
  };
  return { ...form, isSubmitting, serverError, onSubmit: form.handleSubmit(onSubmit) };
}

function LoginFormFields({ register, errors, isSubmitting }: { register: UseFormRegister<LoginFormValues>, errors: FieldErrors<LoginFormValues>, isSubmitting: boolean }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="budi@example.com" {...register('email')} disabled={isSubmitting} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link href="/reset-password" className="text-sm font-medium text-primary hover:underline" tabIndex={-1}>Lupa password?</Link></div>
        <PasswordInput id="password" placeholder="Masukkan password" {...register('password')} disabled={isSubmitting} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message as string}</p>}
      </div>
    </>
  );
}

function LoginFormActions({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-xl transition-all" disabled={isSubmitting}>
        {isSubmitting ? 'Masuk...' : 'Masuk'}
      </Button>
      <div className="mt-6 flex items-center space-x-2">
        <Separator className="flex-1" /><span className="text-xs text-muted-foreground uppercase tracking-wider">Atau masuk dengan</span><Separator className="flex-1" />
      </div>
      <div className="mt-6"><GoogleLoginButton /></div>
    </>
  );
}

export default function LoginPage() {
  const { register, formState: { errors }, isSubmitting, serverError, onSubmit } = useLoginForm();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center text-center pb-2"><Logo className="mb-2 text-3xl" /><CardTitle className="text-xl font-bold">Masuk</CardTitle><CardDescription>Selamat datang kembali</CardDescription></CardHeader>
        <CardContent><form onSubmit={onSubmit} className="space-y-4">{serverError && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{serverError}</div>}<LoginFormFields register={register} errors={errors} isSubmitting={isSubmitting} /><LoginFormActions isSubmitting={isSubmitting} /></form></CardContent>
        <CardFooter className="justify-center"><div className="text-center text-sm text-muted-foreground">Belum punya akun? <Link href="/register" className="text-primary hover:underline">Daftar</Link></div></CardFooter>
      </Card>
    </div>
  );
}
