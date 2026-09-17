import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 karakter')
    .max(50, 'Nama maksimal 50 karakter')
    .regex(/^[a-zA-Z\s\.,'-]+$/, 'Nama hanya boleh berisi huruf dan tanda baca umum (.,\'-), tanpa angka'),
  email: z.string().trim().toLowerCase().min(1, 'Email wajib diisi').max(255, 'Email terlalu panjang').email('Email tidak valid'),
  companyName: z
    .string()
    .trim()
    .min(3, 'Nama perusahaan minimal 3 karakter')
    .regex(/^[a-zA-Z0-9\s\.,'-]+$/, 'Nama perusahaan mengandung karakter yang tidak valid'),
  companyAddress: z.string().trim().min(5, 'Alamat perusahaan minimal 5 karakter'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useTenantRegisterForm(setCooldown: (v: number) => void, setSuccess: (v: boolean) => void) {
  const [isSubmitting, setIsSubmitting] = useState(false), [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true); setServerError(null);
    try {
      await api.post('/auth/register/tenant', data); setSuccess(true); setCooldown(60); toast.success('Pendaftaran berhasil! Silakan cek email kamu.');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message); error.fieldErrors?.forEach((fe) => form.setError(fe.path as keyof RegisterFormValues, { type: 'server', message: fe.message }));
      } else setServerError('Terjadi kesalahan yang tidak diketahui.');
    } finally { setIsSubmitting(false); }
  };
  return { form, isSubmitting, serverError, onSubmit };
}

export function useTenantResend(getValues: () => RegisterFormValues, setCooldown: (v: number) => void) {
  const [isResending, setIsResending] = useState(false);
  const onResend = async () => {
    const email = getValues().email;
    if (!email) return;
    setIsResending(true);
    try { await api.post('/auth/resend-verification', { email }); toast.success('Email verifikasi baru telah dikirim!'); setCooldown(60); }
    catch (error) { toast.error(error instanceof ApiError ? error.message : 'Terjadi kesalahan'); } finally { setIsResending(false); }
  };
  return { isResending, onResend };
}

export function useTenantRegister() {
  const [success, setSuccess] = useState(false), [cooldown, setCooldown] = useState(0);
  const { form, isSubmitting, serverError, onSubmit } = useTenantRegisterForm(setCooldown, setSuccess);
  const { isResending, onResend } = useTenantResend(form.getValues, setCooldown);
  useEffect(() => {
    if (cooldown > 0) { const timer = setTimeout(() => setCooldown((c) => c - 1), 1000); return () => clearTimeout(timer); }
  }, [cooldown]);
  return { form, isSubmitting, serverError, success, cooldown, isResending, onSubmit, onResend };
}
