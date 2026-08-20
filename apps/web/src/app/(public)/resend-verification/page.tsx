'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const resendSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Email tidak valid'),
});

type ResendFormValues = z.infer<typeof resendSchema>;

export default function ResendVerificationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
  });

  const onSubmit = async (data: ResendFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await api.post('/api/auth/verify/resend', data);
      setSuccess(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-heading text-primary">Kirim Ulang Link</CardTitle>
          <CardDescription>Masukkan email terdaftar untuk mendapatkan link verifikasi baru</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="rounded-md bg-emerald-50 p-4 text-center">
              <p className="text-emerald-800 font-medium">Berhasil terkirim!</p>
              <p className="text-sm text-emerald-600 mt-1">Silakan cek kotak masuk email kamu.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="budi@example.com"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Ulang'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
