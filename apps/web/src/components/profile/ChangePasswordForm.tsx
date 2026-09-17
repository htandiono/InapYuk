'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { api, ApiError } from '@/lib/api-client';

const passwordSchema = z.string().min(8, 'Password minimal 8 karakter').max(72, 'Password maksimal 72 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar').regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka').regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial');

const formSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword !== d.oldPassword, { message: 'Password baru harus berbeda dari password lama', path: ['newPassword'] })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Password konfirmasi tidak cocok', path: ['confirmPassword'] });

type FormData = z.infer<typeof formSchema>;
type FormControl = ReturnType<typeof useForm<FormData>>['control'];

function PasswordField({ control, name, label, placeholder, hint, disabled }: {
  control: FormControl; name: keyof FormData; label: string; placeholder: string; hint?: string; disabled: boolean;
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl><PasswordInput placeholder={placeholder} {...field} disabled={disabled} /></FormControl>
        {hint && <p className="text-[0.8rem] text-muted-foreground mt-1.5">{hint}</p>}
        <FormMessage />
      </FormItem>
    )} />
  );
}

async function submitPasswordChange(values: FormData, setSubmitting: (v: boolean) => void, reset: () => void) {
  setSubmitting(true);
  try {
    await api.post('/users/password', values);
    toast.success('Password berhasil diubah');
    reset();
  } catch (error: unknown) {
    toast.error((error instanceof ApiError ? error.message : null) || 'Terjadi kesalahan');
  } finally { setSubmitting(false); }
}

function SocialLoginPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Password</CardTitle>
        <CardDescription>Anda menggunakan login sosial (Google). Akun ini tidak memiliki password untuk diubah.</CardDescription>
      </CardHeader>
    </Card>
  );
}

function ChangePasswordFormContent({ form, isSubmitting }: { form: UseFormReturn<FormData>; isSubmitting: { value: boolean; setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>> }; }) {
  const hint = 'Minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial.';
  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v: FormData) => submitPasswordChange(v, isSubmitting.setIsSubmitting, () => form.reset()))} className="space-y-4 max-w-md mx-auto">
          <PasswordField control={form.control} name="oldPassword" label="Password Lama" placeholder="Masukkan password saat ini" disabled={isSubmitting.value} />
          <PasswordField control={form.control} name="newPassword" label="Password Baru" placeholder="Masukkan password baru" hint={hint} disabled={isSubmitting.value} />
          <PasswordField control={form.control} name="confirmPassword" label="Konfirmasi Password Baru" placeholder="Ketik ulang password baru" disabled={isSubmitting.value} />
          <Button type="submit" disabled={isSubmitting.value} className="w-full">{isSubmitting.value ? 'Memproses...' : 'Ubah Password'}</Button>
        </form>
      </Form>
    </CardContent>
  );
}

export function ChangePasswordForm({ isSocialLogin }: { isSocialLogin: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' } });
  if (isSocialLogin) return <SocialLoginPlaceholder />;
  
  return (
    <Card>
      <CardHeader><CardTitle>Ubah Password</CardTitle><CardDescription>Pastikan Anda menggunakan password yang kuat dan unik.</CardDescription></CardHeader>
      <ChangePasswordFormContent form={form} isSubmitting={{ value: isSubmitting, setIsSubmitting }} />
    </Card>
  );
}
