'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial');

const verifySchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type VerifyFormValues = z.infer<typeof verifySchema>;

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
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

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-destructive">Link Tidak Valid</CardTitle>
          <CardDescription>
            Link verifikasi tidak valid atau tidak lengkap. Silakan periksa kembali email kamu.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/resend-verification" className="text-primary hover:underline text-sm mx-auto">
            Kirim ulang link verifikasi
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const onSubmit = async (data: VerifyFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await api.post<{ role: string }>('/auth/verify', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Verifikasi berhasil! Silakan masuk.');
      if (res.role === 'TENANT') {
        router.push('/tenant/login');
      } else {
        router.push('/login');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        if (error.fieldErrors && error.fieldErrors.length > 0) {
          error.fieldErrors.forEach((fe) => {
            setError(fe.path as keyof VerifyFormValues, { type: 'server', message: fe.message });
          });
        }
      } else {
        setServerError('Terjadi kesalahan yang tidak diketahui.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-heading text-primary">Verifikasi Akun</CardTitle>
        <CardDescription>Buat password untuk menyelesaikan pendaftaran kamu</CardDescription>
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
            <Input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Ketik ulang password"
              {...register('confirmPassword')}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Verifikasi & Simpan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={<div>Memuat...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
