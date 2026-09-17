'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { FormContent, ConfirmResetValues } from './ConfirmResetPasswordFields';

const passwordSchema = z.string().min(8, 'Password minimal 8 karakter').max(72, 'Password maksimal 72 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar').regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka').regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial');

const confirmResetSchema = z.object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: 'Password tidak cocok', path: ['confirmPassword'] });

function TokenMissingView() {
  return (
    <Card className="w-full max-w-md border-destructive">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-destructive">Link Tidak Valid</CardTitle>
        <CardDescription>Token reset password tidak valid atau sudah digunakan</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        <Link href="/reset-password" className="text-primary hover:underline text-sm">Minta link reset baru</Link>
      </CardFooter>
    </Card>
  );
}

function CheckingView() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </CardContent>
    </Card>
  );
}

async function submitReset(token: string, data: ConfirmResetValues, router: ReturnType<typeof useRouter>, setError: (s: string | null) => void, setSubmitting: (b: boolean) => void) {
  setSubmitting(true);
  setError(null);
  try {
    const res = await api.post<{ role: string }>('/auth/password/confirm', { token, password: data.password, confirmPassword: data.confirmPassword });
    router.push(res.role === 'TENANT' ? '/tenant/login?reset=success' : '/login?reset=success');
  } catch (error: unknown) {
    setError(error instanceof ApiError ? error.message : 'Terjadi kesalahan.');
    setSubmitting(false);
  }
}

function useConfirmToken(token: string | null) {
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>(token ? 'checking' : 'invalid');
  useEffect(() => {
    if (!token) return;
    let mounted = true;
    api.get(`/auth/password/check?token=${token}`).then(() => { if (mounted) setTokenStatus('valid'); }).catch(() => { if (mounted) setTokenStatus('invalid'); });
    return () => { mounted = false; };
  }, [token]);
  return tokenStatus;
}

export function ConfirmResetPasswordForm() {
  const router = useRouter(), token = useSearchParams().get('token');
  const [isSubmitting, setIsSubmitting] = useState(false), [serverError, setServerError] = useState<string | null>(null);
  const tokenStatus = useConfirmToken(token);
  const { register, handleSubmit, formState: { errors } } = useForm<ConfirmResetValues>({ resolver: zodResolver(confirmResetSchema) });
  if (tokenStatus === 'checking') return <CheckingView />;
  if (tokenStatus === 'invalid') return <TokenMissingView />;
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center text-center pb-2"><Logo className="mb-2 text-3xl" /><CardTitle className="text-xl font-bold">Buat Password Baru</CardTitle><CardDescription>Silakan masukkan password baru Anda</CardDescription></CardHeader>
      <CardContent><FormContent serverError={serverError} errors={errors} onSubmit={handleSubmit((d) => token && submitReset(token, d, router, setServerError, setIsSubmitting))} isSubmitting={isSubmitting} register={register} /></CardContent>
    </Card>
  );
}
