'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ControllerRenderProps, type UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api-client';

const formSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email wajib diisi').max(255, 'Email terlalu panjang').email('Format email tidak valid'),
});

type FormData = z.infer<typeof formSchema>;
type FormControl = ReturnType<typeof useForm<FormData>>['control'];

function SuccessView({ onReset }: { onReset: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cek Email Anda</CardTitle>
        <CardDescription>Kami telah mengirimkan link konfirmasi ke email baru Anda. Silakan klik link tersebut untuk menyelesaikan proses perubahan email.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onReset} className="w-full">Kirim ulang atau gunakan email lain</Button>
      </CardContent>
    </Card>
  );
}

function EmailField({ control, disabled }: { control: FormControl; disabled: boolean }) {
  return (
    <FormField control={control} name="email" render={({ field }: { field: ControllerRenderProps<FormData, 'email'> }) => (
      <FormItem>
        <FormLabel>Email Baru</FormLabel>
        <FormControl><Input placeholder="email@contoh.com" {...field} disabled={disabled} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

async function submitEmailChange(values: FormData, setSuccess: (v: boolean) => void, setSubmitting: (v: boolean) => void) {
  setSubmitting(true);
  try {
    await api.post('/users/email', values);
    setSuccess(true);
    toast.success('Link konfirmasi telah dikirim ke email baru Anda');
  } catch (error: unknown) {
    toast.error((error instanceof ApiError ? error.message : null) || 'Terjadi kesalahan');
  } finally {
    setSubmitting(false);
  }
}

function EmailFormContent({ form, isSubmitting, setSuccess, setIsSubmitting }: { form: UseFormReturn<FormData>; isSubmitting: boolean; setSuccess: (v: boolean) => void; setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>; }) {
  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v: FormData) => submitEmailChange(v, setSuccess, setIsSubmitting))} className="space-y-4 max-w-md mx-auto">
          <EmailField control={form.control} disabled={isSubmitting} />
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Memproses...' : 'Ubah Email'}</Button>
        </form>
      </Form>
    </CardContent>
  );
}

export function EmailChangeForm() {
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { email: '' } });
  if (success) return <SuccessView onReset={() => setSuccess(false)} />;
  return (
    <Card>
      <CardHeader><CardTitle>Ubah Email</CardTitle><CardDescription>Perhatian: Mengubah email akan membuat status verifikasi Anda hilang sampai Anda mengkonfirmasi email baru.</CardDescription></CardHeader>
      <EmailFormContent form={form} isSubmitting={isSubmitting} setSuccess={setSuccess} setIsSubmitting={setIsSubmitting} />
    </Card>
  );
}
