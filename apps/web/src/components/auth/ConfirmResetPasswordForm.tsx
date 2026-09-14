'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial');

const confirmResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type ConfirmResetValues = z.infer<typeof confirmResetSchema>;

export function ConfirmResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmResetValues>({
    resolver: zodResolver(confirmResetSchema),
  });

  const onSubmit = async (data: ConfirmResetValues) => {
    if (!token) {
      setServerError('Token tidak ditemukan di URL');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await api.post('/auth/password/confirm', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      router.push('/login?reset=success');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError('Terjadi kesalahan yang tidak diketahui.');
      }
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-destructive">Link Tidak Valid</CardTitle>
          <CardDescription>Token reset password tidak ditemukan</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/reset-password" className="text-primary hover:underline text-sm">
            Minta link reset baru
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center text-center pb-2">
        <Logo className="mb-2 text-3xl" />
        <CardTitle className="text-xl font-bold">Buat Password Baru</CardTitle>
        <CardDescription>Silakan masukkan password baru Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <PasswordInput
              id="password"
              placeholder="Minimal 8 karakter"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Ketik ulang password"
              {...register('confirmPassword')}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
