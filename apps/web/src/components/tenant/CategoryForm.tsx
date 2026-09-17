'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FieldErrors, UseFormRegister, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const categorySchema = z.object({
  name: z.string().min(3, 'Nama kategori harus terdiri dari minimal 3 karakter.').max(50, 'Nama kategori tidak boleh lebih dari 50 karakter.').regex(/^[a-zA-Z0-9\s-]+$/, 'Nama kategori hanya boleh mengandung huruf, angka, spasi, dan tanda hubung (-).'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: { id: string; name: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

async function submitCategory(values: CategoryFormValues, initialData: CategoryFormProps['initialData'], router: ReturnType<typeof useRouter>, setLoading: (v: boolean) => void, onSuccess?: () => void) {
  setLoading(true);
  try {
    const url = initialData ? `/api/categories/tenant/categories/${initialData.id}` : '/api/categories/tenant/categories';
    const res = await fetch(url, { method: initialData ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');
    toast.success(initialData ? 'Kategori diperbarui' : 'Kategori ditambahkan');
    if (onSuccess) onSuccess();
    router.refresh();
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : String(err));
  } finally { setLoading(false); }
}

function useCategoryFormSubmit(initialData: { id: string; name: string } | undefined, onSuccess?: () => void) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const onSubmit = (values: CategoryFormValues) => submitCategory(values, initialData, router, setLoading, onSuccess);
  return { loading, onSubmit };
}

function CategoryFormFields({ register, errors, loading, onCancel }: { register: UseFormRegister<CategoryFormValues>; errors: FieldErrors<CategoryFormValues>; loading: boolean; onCancel?: () => void }) {
  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Nama Kategori</label>
        <Input id="name" {...register('name')} placeholder="Misal: Vila Mewah" disabled={loading} className={errors.name ? 'border-destructive' : ''} />
        {errors.name && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium"><span>⚠</span> {errors.name.message}</p>}
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Batal</Button>}
        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </>
  );
}

export default function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema), defaultValues: { name: initialData?.name || '' } });
  const { loading, onSubmit } = useCategoryFormSubmit(initialData, onSuccess);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <CategoryFormFields register={register} errors={errors} loading={loading} onCancel={onCancel} />
    </form>
  );
}
