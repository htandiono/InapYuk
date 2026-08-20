'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

const verifySchema = z.object({
  password: z.string().min(6, 'Password minimal 6 karakter'),
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
      </Card>
    );
  }

  const onSubmit = async (data: VerifyFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await api.post('/api/auth/verify', {
        token,
        password: data.password,
      });
      toast.success('Verifikasi berhasil! Silakan masuk.');
      router.push('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
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
              placeholder="Minimal 6 karakter"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
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
