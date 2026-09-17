'use client';

import { useState, useEffect } from 'react';
import { FieldErrors, UseFormRegister, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email wajib diisi').max(255, 'Email terlalu panjang').email('Email tidak valid'),
});

type ResendFormValues = z.infer<typeof resendSchema>;

function useResendVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false), [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false), [cooldown, setCooldown] = useState(0);
  const form = useForm<ResendFormValues>({ resolver: zodResolver(resendSchema) });
  useEffect(() => {
    if (cooldown > 0) { const timer = setTimeout(() => setCooldown((p) => p - 1), 1000); return () => clearTimeout(timer); }
  }, [cooldown]);
  const onSubmit = async (data: ResendFormValues) => {
    setIsSubmitting(true); setServerError(null); setSuccess(false);
    try { await api.post('/auth/resend-verification', data); setSuccess(true); setCooldown(60); }
    catch (err) { setServerError(err instanceof ApiError ? err.message : 'Terjadi kesalahan.'); } finally { setIsSubmitting(false); }
  };
  return { ...form, isSubmitting, serverError, success, cooldown, onSubmit: form.handleSubmit(onSubmit) };
}

function ResendVerificationForm({ register, errors, isSubmitting, cooldown }: { register: UseFormRegister<ResendFormValues>; errors: FieldErrors<ResendFormValues>; isSubmitting: boolean; cooldown: number; }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="budi@example.com" {...register('email')} disabled={isSubmitting || cooldown > 0} />
      {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
    </div>
  );
}

function ResendVerificationFormWrapper({ serverError, register, errors, isSubmitting, cooldown, onSubmit }: { serverError: string | null; register: UseFormRegister<ResendFormValues>; errors: FieldErrors<ResendFormValues>; isSubmitting: boolean; cooldown: number; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{serverError}</div>}
      <ResendVerificationForm register={register} errors={errors} isSubmitting={isSubmitting} cooldown={cooldown} />
      <Button type="submit" className="w-full" disabled={isSubmitting || cooldown > 0}>{isSubmitting ? 'Mengirim...' : cooldown > 0 ? `Kirim Ulang dalam ${cooldown}s` : 'Kirim Ulang'}</Button>
    </form>
  );
}

export default function ResendVerificationPage() {
  const { register, formState: { errors }, isSubmitting, serverError, success, cooldown, onSubmit } = useResendVerification();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle className="text-2xl font-bold font-heading text-primary">Kirim Ulang Link</CardTitle><CardDescription>Masukkan email terdaftar untuk mendapatkan link verifikasi baru</CardDescription></CardHeader>
        <CardContent>
          {success && <div className="mb-4 rounded-md bg-emerald-50 p-4 text-center"><p className="text-emerald-800 font-medium">Berhasil terkirim!</p><p className="text-sm text-emerald-600 mt-1">Silakan cek kotak masuk email kamu.</p></div>}
          <ResendVerificationFormWrapper serverError={serverError} register={register} errors={errors} isSubmitting={isSubmitting} cooldown={cooldown} onSubmit={onSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
