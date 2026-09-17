'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { AvatarUpload } from './AvatarUpload';
import { GoogleLinkButton } from './GoogleLinkButton';

const formSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
});

type FormData = z.infer<typeof formSchema>;

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
    provider: 'EMAIL' | 'GOOGLE';
  };
}

function NameField({
  control,
  disabled,
}: {
  control: ReturnType<typeof useForm<FormData>>['control'];
  disabled: boolean;
}) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nama Lengkap</FormLabel>
          <FormControl>
            <Input placeholder="Masukkan nama Anda" {...field} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function EmailField({ email }: { email: string }) {
  return (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input value={email} disabled className="bg-muted" />
      </FormControl>
      <p className="text-[0.8rem] text-muted-foreground">Email tidak dapat diubah di form ini.</p>
    </FormItem>
  );
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: user.name },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (selectedFile) formData.append('avatar', selectedFile);
      await api.patch('/users/profile', formData);
      toast.success('Profil berhasil diperbarui');
      router.refresh();
    } catch (error: unknown) {
      toast.error((error as { message?: string }).message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Saya</CardTitle>
        <CardDescription>Kelola informasi publik profil Anda.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUpload
          currentUrl={user.avatarUrl}
          name={user.name}
          onFileSelect={setSelectedFile}
          disabled={isSubmitting}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
            <EmailField email={user.email} />
            <NameField control={form.control} disabled={isSubmitting} />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </form>
        </Form>
        {user.provider === 'EMAIL' && (
          <div className="pt-6 mt-6 border-t border-border/50 max-w-md mx-auto">
            <h3 className="text-sm font-medium mb-1">Tautkan Akun Google</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Anda dapat menautkan akun Google untuk mempermudah login di masa mendatang.
            </p>
            <GoogleLinkButton />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
