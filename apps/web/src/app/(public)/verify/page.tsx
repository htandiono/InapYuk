'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { api, ApiError } from '@/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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

function useVerifyToken() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isChecking, setIsChecking] = useState(!!token);
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const checkToken = async () => {
      try {
        await api.get(`/auth/verify/check?token=${token}`);
      } catch (error) {
        if (error instanceof ApiError) {
          setCheckError(error.message);
        } else {
          setCheckError('Link verifikasi tidak valid.');
        }
      } finally {
        setIsChecking(false);
      }
    };
    checkToken();
  }, [token]);

  return { token, isChecking, checkError };
}

function CheckingState() {
  return (
    <Card className="w-full max-w-md p-8 flex justify-center items-center">
      <p className="text-muted-foreground">Memeriksa link verifikasi...</p>
    </Card>
  );
}

function ErrorState({ checkError, onNavigateToLogin }: { checkError: string; onNavigateToLogin: () => void }) {
  const isAlreadyVerified = checkError === 'Akun ini sudah diverifikasi sebelumnya';
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-destructive">
          {isAlreadyVerified ? 'Sudah Diverifikasi' : 'Link Tidak Valid'}
        </CardTitle>
        <CardDescription>
          {isAlreadyVerified
            ? 'User telah berhasil diverifikasi sebelumnya. Silakan menuju halaman login.'
            : checkError || 'Link verifikasi tidak valid atau tidak lengkap. Silakan periksa kembali email kamu.'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        {isAlreadyVerified ? (
          <Button className="w-full" onClick={onNavigateToLogin}>
            Menuju halaman Login
          </Button>
        ) : (
          <Link href="/resend-verification" className="text-primary hover:underline text-sm">
            Kirim ulang link verifikasi
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

function VerifyFormCard({ token }: { token: string }) {
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
      const res = await api.post<{ role: string }>('/auth/verify', {
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Verifikasi berhasil! Silakan masuk.');
      router.push(res.role === 'TENANT' ? '/tenant/login' : '/login');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        error.fieldErrors?.forEach((fe) => {
          setError(fe.path as keyof VerifyFormValues, { type: 'server', message: fe.message });
        });
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
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{serverError}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <PasswordInput id="password" placeholder="Minimal 8 karakter" {...register('password')} disabled={isSubmitting} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <PasswordInput id="confirmPassword" placeholder="Ketik ulang password" {...register('confirmPassword')} disabled={isSubmitting} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Verifikasi & Simpan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function VerifyForm() {
  const router = useRouter();
  const { token, isChecking, checkError } = useVerifyToken();

  if (isChecking) return <CheckingState />;
  if (!token || checkError) return <ErrorState checkError={checkError || ''} onNavigateToLogin={() => router.push('/login')} />;
  return <VerifyFormCard token={token} />;
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
