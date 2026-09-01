import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').regex(/^[a-zA-Z0-9\s\.,'-]+$/, 'Nama mengandung karakter yang tidak valid'),
  email: z.string().min(1, 'Email wajib diisi').email('Email tidak valid'),
  companyName: z.string().trim().min(3, 'Nama perusahaan minimal 3 karakter').regex(/^[a-zA-Z0-9\s\.,'-]+$/, 'Nama perusahaan mengandung karakter yang tidak valid'),
  companyAddress: z.string().trim().min(5, 'Alamat perusahaan minimal 5 karakter'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

function useCooldown() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const startCooldown = (seconds: number) => setCooldown(seconds);
  const isCoolingDown = cooldown > 0;

  return { cooldown, startCooldown, isCoolingDown };
}

function handleApiError(error: unknown, setError: (path: keyof RegisterFormValues, options: { type: string; message: string }) => void) {
  if (error instanceof ApiError) {
    error.fieldErrors?.forEach((fe) => {
      setError(fe.path as keyof RegisterFormValues, { type: 'server', message: fe.message });
    });
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak diketahui.';
}

export function useTenantRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { cooldown, startCooldown, isCoolingDown } = useCooldown();

  const form = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await api.post('/auth/register/tenant', data);
      setSuccess(true);
      startCooldown(60);
      toast.success('Pendaftaran berhasil! Silakan cek email kamu.');
    } catch (error) {
      setServerError(handleApiError(error, form.setError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    const email = form.getValues('email');
    if (!email) return;
    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Email verifikasi baru telah dikirim!');
      startCooldown(60);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsResending(false);
    }
  };

  return { form, isSubmitting, serverError, success, cooldown: isCoolingDown ? cooldown : 0, isResending, onSubmit, onResend };
}
