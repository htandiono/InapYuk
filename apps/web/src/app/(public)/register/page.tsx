'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 karakter')
    .regex(/^[a-zA-Z0-9\s\.,'-]+$/, 'Nama mengandung karakter yang tidak valid'),
  email: z.string().min(1, 'Email wajib diisi').email('Email tidak valid'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await api.post('/api/auth/register/user', data);
      setSuccess(true);
      setCooldown(60);
      toast.success('Pendaftaran berhasil! Silakan cek email kamu.');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        if (error.fieldErrors && error.fieldErrors.length > 0) {
          error.fieldErrors.forEach((fe) => {
            setError(fe.path as keyof RegisterFormValues, { type: 'server', message: fe.message });
          });
        }
      } else {
        setServerError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    const email = getValues('email');
    if (!email) return;

    setIsResending(true);
    try {
      await api.post('/api/auth/resend-verification', { email });
      toast.success('Email verifikasi baru telah dikirim!');
      setCooldown(60);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Berhasil!</CardTitle>
            <CardDescription>
              Pendaftaran berhasil. Silakan cek email kamu untuk link verifikasi.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 justify-center">
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Kembali ke Beranda
            </Button>
            <Button 
              onClick={onResend} 
              variant="link" 
              className="text-sm text-primary p-0 h-auto"
              disabled={isResending || cooldown > 0}
            >
              {isResending 
                ? 'Mengirim...' 
                : cooldown > 0 
                ? `Kirim ulang email (${cooldown}s)` 
                : 'Belum menerima email? Kirim ulang'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-heading text-primary">Daftar Akun</CardTitle>
          <CardDescription>Mulai cari dan bandingkan penginapan terbaik</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {serverError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Budi Santoso"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

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
              {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>

            <div className="mt-4 text-center text-sm">
              Punya properti?{' '}
              <Link href="/tenant/register" className="text-primary hover:underline">
                Daftar sebagai Tenant
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
