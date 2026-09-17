'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { api } from '@/lib/api-client';

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial');

const formSchema = z
  .object({
    oldPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password konfirmasi tidak cocok',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

function PasswordFields({
  control,
  disabled,
}: {
  control: ReturnType<typeof useForm<FormData>>['control'];
  disabled: boolean;
}) {
  return (
    <>
      <FormField
        control={control}
        name="oldPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password Lama</FormLabel>
            <FormControl>
              <PasswordInput placeholder="••••••••" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="newPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password Baru</FormLabel>
            <FormControl>
              <PasswordInput placeholder="••••••••" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Konfirmasi Password Baru</FormLabel>
            <FormControl>
              <PasswordInput placeholder="••••••••" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function ChangePasswordForm({ isSocialLogin }: { isSocialLogin: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/users/password', values);
      toast.success('Password berhasil diubah');
      form.reset();
    } catch (error: unknown) {
      toast.error((error as { message?: string }).message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSocialLogin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>
            Anda menggunakan login sosial (Google). Akun ini tidak memiliki password untuk diubah.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Password</CardTitle>
        <CardDescription>Pastikan Anda menggunakan password yang kuat dan unik.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
            <PasswordFields control={form.control} disabled={isSubmitting} />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Memproses...' : 'Ubah Password'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
