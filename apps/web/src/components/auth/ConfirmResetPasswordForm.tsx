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

interface PasswordFieldProps {
  id: 'password' | 'confirmPassword';
  label: string;
  placeholder: string;
  register: ReturnType<typeof useForm<ConfirmResetValues>>['register'];
  error?: string;
  disabled: boolean;
}

function PasswordField({ id, label, placeholder, register, error, disabled }: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <PasswordInput id={id} placeholder={placeholder} {...register(id)} disabled={disabled} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function FormContent({
  serverError,
  errors,
  onSubmit,
  isSubmitting,
  register,
}: {
  serverError: string | null;
  errors: { password?: { message?: string }; confirmPassword?: { message?: string } };
  onSubmit: (e: React.BaseSyntheticEvent) => void;
  isSubmitting: boolean;
  register: ReturnType<typeof useForm<ConfirmResetValues>>['register'];
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}
      <PasswordField
        id="password"
        label="Password Baru"
        placeholder="Minimal 8 karakter"
        register={register}
        error={errors.password?.message}
        disabled={isSubmitting}
      />
      <PasswordField
        id="confirmPassword"
        label="Konfirmasi Password Baru"
        placeholder="Ketik ulang password"
        register={register}
        error={errors.confirmPassword?.message}
        disabled={isSubmitting}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
      </Button>
    </form>
  );
}

function TokenMissingView() {
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
      setServerError(error instanceof ApiError ? error.message : 'Terjadi kesalahan.');
      setIsSubmitting(false);
    }
  };

  if (!token) return <TokenMissingView />;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center text-center pb-2">
        <Logo className="mb-2 text-3xl" />
        <CardTitle className="text-xl font-bold">Buat Password Baru</CardTitle>
        <CardDescription>Silakan masukkan password baru Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <FormContent
          serverError={serverError}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          register={register}
        />
      </CardContent>
    </Card>
  );
}
