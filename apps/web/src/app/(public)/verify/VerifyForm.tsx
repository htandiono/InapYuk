'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FieldErrors, UseFormRegister, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(72, 'Password maksimal 72 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial');

const verifySchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type VerifyFormValues = z.infer<typeof verifySchema>;

function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{message}</div>;
}

type PProps = { register: UseFormRegister<VerifyFormValues>; errors: FieldErrors<VerifyFormValues>; disabled: boolean; };
function PasswordFields({ register, errors, disabled }: PProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="password">Password Baru</Label><PasswordInput id="password" placeholder="Minimal 8 karakter" {...register('password')} disabled={disabled} />
        <p className="text-[0.8rem] text-muted-foreground mt-1.5 leading-snug">Minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial.</p>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password</Label><PasswordInput id="confirmPassword" placeholder="Ketik ulang password" {...register('confirmPassword')} disabled={disabled} />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>
    </>
  );
}

function useVerifyForm(token: string) {
  const router = useRouter(), [isSubmitting, setIsSubmitting] = useState(false), [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<VerifyFormValues>({ resolver: zodResolver(verifySchema) });
  const onSubmit = async (data: VerifyFormValues) => {
    setIsSubmitting(true); setServerError(null);
    try {
      const res = await api.post<{ role: string }>('/auth/verify', { token, ...data });
      toast.success('Verifikasi berhasil! Silakan masuk.'); router.push(res.role === 'TENANT' ? '/tenant/login' : '/login');
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Terjadi kesalahan.');
      if (err instanceof ApiError) err.fieldErrors?.forEach((fe) => form.setError(fe.path as keyof VerifyFormValues, { type: 'server', message: fe.message }));
    } finally { setIsSubmitting(false); }
  };
  return { ...form, isSubmitting, serverError, onSubmit: form.handleSubmit(onSubmit) };
}

export function VerifyForm({ token }: { token: string }) {
  const { register, formState: { errors }, isSubmitting, serverError, onSubmit } = useVerifyForm(token);
  return (
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle className="text-2xl font-bold font-heading text-primary">Verifikasi Akun</CardTitle><CardDescription>Buat password untuk menyelesaikan pendaftaran kamu</CardDescription></CardHeader>
      <CardContent><form onSubmit={onSubmit} className="space-y-4">{serverError && <ErrorBanner message={serverError} />}<PasswordFields register={register} errors={errors} disabled={isSubmitting} /><Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Verifikasi & Simpan'}</Button></form></CardContent>
    </Card>
  );
}
