import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').regex(/^[a-zA-Z0-9\s\.,'-]+$/, 'Nama mengandung karakter yang tidak valid'),
  email: z.string().min(1, 'Email wajib diisi').email('Email tidak valid'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export const REGISTER_ERROR_MSG = 'Terjadi kesalahan yang tidak diketahui.';

export function useRegisterCooldown() {
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);
  return { cooldown, setCooldown };
}

export function useRegisterForm(setCooldown: (v: number) => void, setSuccess: (v: boolean) => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await api.post('/auth/register/user', data);
      setSuccess(true);
      setCooldown(60);
      toast.success('Pendaftaran berhasil! Silakan cek email kamu.');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        error.fieldErrors?.forEach((fe) => form.setError(fe.path as keyof RegisterFormValues, { type: 'server', message: fe.message }));
      } else setServerError(REGISTER_ERROR_MSG);
    } finally {
      setIsSubmitting(false);
    }
  };
  return { form, isSubmitting, serverError, onSubmit };
}

export function useRegisterResend(getValues: () => RegisterFormValues, setCooldown: (v: number) => void) {
  const [isResending, setIsResending] = useState(false);
  const onResend = async () => {
    const email = getValues().email;
    if (!email) return;
    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Email verifikasi baru telah dikirim!');
      setCooldown(60);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error(REGISTER_ERROR_MSG);
    } finally {
      setIsResending(false);
    }
  };
  return { isResending, onResend };
}
