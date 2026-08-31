'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const categorySchema = z.object({
  name: z
    .string()
    .min(3, 'Nama kategori harus terdiri dari minimal 3 karakter.')
    .max(50, 'Nama kategori tidak boleh lebih dari 50 karakter.')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Nama kategori hanya boleh mengandung huruf, angka, spasi, dan tanda hubung (-).')
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: { id: string; name: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || ''
    }
  });

  const onSubmit = async (values: CategoryFormValues) => {
    setLoading(true);
    try {
      const url = initialData 
        ? `/api/categories/tenant/categories/${initialData.id}` 
        : '/api/categories/tenant/categories';
      
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan');

      toast.success(initialData ? 'Kategori diperbarui' : 'Kategori ditambahkan');
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Nama Kategori</label>
        <Input 
          id="name"
          {...register('name')}
          placeholder="Misal: Vila Mewah"
          disabled={loading}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium">
            <span>⚠</span> {errors.name.message}
          </p>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
