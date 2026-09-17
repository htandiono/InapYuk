'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

const resetRequestSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Email tidak valid'),
});

type ResetRequestValues = z.infer<typeof resetRequestSchema>;

function SuccessView({ message }: { message: string }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center text-center pb-2">
        <CheckCircle2 className="mb-2 h-12 w-12 text-green-500" />
        <CardTitle className="text-xl font-bold">Email Terkirim</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-muted-foreground">
        <p>{message}</p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-primary hover:underline text-sm">
          Kembali ke halaman Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}

function FormFields({
  register,
  errors,
  isSubmitting,
}: {
  register: ReturnType<typeof useForm<ResetRequestValues>>['register'];
  errors: { email?: { message?: string } };
  isSubmitting: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="budi@example.com"
          {...register('email')}
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Memproses...' : 'Kirim Link Reset'}
      </Button>
    </>
  );
}

export function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
  });

  const onSubmit = async (data: ResetRequestValues) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      await api.post('/auth/password/reset', data);
      setSuccessMessage('Jika email terdaftar, kami telah mengirimkan link reset');
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) return <SuccessView message={successMessage} />;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center text-center pb-2">
        <Logo className="mb-2 text-3xl" />
        <CardTitle className="text-xl font-bold">Lupa Password</CardTitle>
        <CardDescription>Masukkan email Anda untuk menerima link reset</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}
          <FormFields register={register} errors={errors} isSubmitting={isSubmitting} />
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Kembali ke halaman Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}
