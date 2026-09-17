'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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

function PasswordFields({
  register,
  errors,
  disabled,
}: {
  register: ReturnType<typeof useForm<VerifyFormValues>>['register'];
  errors: { password?: { message?: string }; confirmPassword?: { message?: string } };
  disabled: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="password">Password Baru</Label>
        <PasswordInput
          id="password"
          placeholder="Minimal 8 karakter"
          {...register('password')}
          disabled={disabled}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Ketik ulang password"
          {...register('confirmPassword')}
          disabled={disabled}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
    </>
  );
}

export function VerifyForm({ token }: { token: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await api.post<{ role: string }>('/auth/verify', { token, ...data });
      toast.success('Verifikasi berhasil! Silakan masuk.');
      router.push(res.role === 'TENANT' ? '/tenant/login' : '/login');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        if (error.fieldErrors?.length) {
          error.fieldErrors.forEach((fe) =>
            setError(fe.path as keyof VerifyFormValues, { type: 'server', message: fe.message }),
          );
        }
      } else {
        setServerError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-heading text-primary">
          Verifikasi Akun
        </CardTitle>
        <CardDescription>Buat password untuk menyelesaikan pendaftaran kamu</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <ErrorBanner message={serverError} />}
          <PasswordFields register={register} errors={errors} disabled={isSubmitting} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Verifikasi & Simpan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
