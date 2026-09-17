'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api-client';
import { AvatarUpload } from './AvatarUpload';
import { GoogleLinkButton } from './GoogleLinkButton';

const formSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(50, 'Nama maksimal 50 karakter').regex(/^[a-zA-Z\s\.,'-]+$/, "Nama hanya boleh berisi huruf dan tanda baca umum (.,'-), tanpa angka"),
});

type FormData = z.infer<typeof formSchema>;
type FormControl = ReturnType<typeof useForm<FormData>>['control'];

interface ProfileFormProps {
  user: { name: string; email: string; avatarUrl: string | null; provider: 'EMAIL' | 'GOOGLE' };
}

function NameField({ control, disabled }: { control: FormControl; disabled: boolean }) {
  return (
    <FormField control={control} name="name" render={({ field }) => (
      <FormItem>
        <FormLabel>Nama Lengkap</FormLabel>
        <FormControl><Input placeholder="Masukkan nama Anda" {...field} disabled={disabled} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

function EmailField({ email }: { email: string }) {
  return (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl><Input value={email} disabled className="bg-muted" /></FormControl>
      <p className="text-[0.8rem] text-muted-foreground">Email tidak dapat diubah di form ini.</p>
    </FormItem>
  );
}

function ProfileGoogleLink() {
  return (
    <div className="pt-6 mt-6 border-t border-border/50 max-w-md mx-auto">
      <h3 className="text-sm font-medium mb-1">Tautkan Akun Google</h3>
      <p className="text-xs text-muted-foreground mb-4">Anda dapat menautkan akun Google untuk mempermudah login di masa mendatang.</p>
      <GoogleLinkButton />
    </div>
  );
}

function buildProfileFormData(name: string, selectedFile: File | null) {
  const formData = new FormData();
  formData.append('name', name);
  if (selectedFile) formData.append('avatar', selectedFile);
  return formData;
}

function useProfileSubmit(selectedFile: File | null) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      await api.patch('/users/profile', buildProfileFormData(values.name, selectedFile));
      toast.success('Profil berhasil diperbarui');
      router.refresh();
    } catch (error: unknown) {
      toast.error((error instanceof ApiError ? error.message : null) || 'Terjadi kesalahan');
    } finally { setIsSubmitting(false); }
  };
  return { isSubmitting, onSubmit };
}

function ProfileFormContent({ form, user, isSubmitting, onSubmit }: { form: UseFormReturn<FormData>; user: ProfileFormProps['user']; isSubmitting: boolean; onSubmit: (values: FormData) => void; }) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
        <EmailField email={user.email} />
        <NameField control={form.control} disabled={isSubmitting} />
        <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
      </form>
    </Form>
  );
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { name: user.name } });
  const { isSubmitting, onSubmit } = useProfileSubmit(selectedFile);
  return (
    <Card>
      <CardHeader><CardTitle>Profil Saya</CardTitle><CardDescription>Kelola informasi publik profil Anda.</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <AvatarUpload currentUrl={user.avatarUrl} name={user.name} onFileSelect={setSelectedFile} disabled={isSubmitting} />
        <ProfileFormContent form={form} user={user} isSubmitting={isSubmitting} onSubmit={onSubmit} />
        {user.provider === 'EMAIL' && <ProfileGoogleLink />}
      </CardContent>
    </Card>
  );
}
