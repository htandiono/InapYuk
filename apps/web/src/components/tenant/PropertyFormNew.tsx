'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { PropertyFormImages } from './PropertyFormImage';
import { PropertyFormLocation } from './PropertyFormLocation';

export type PropertyFormInitData = {
  id?: string;
  name?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  images?: { id: string; url: string }[];
};

const propertySchema = z.object({
  name: z.string().min(3, 'Nama properti harus terdiri dari minimal 3 karakter.').max(100, 'Nama properti tidak boleh lebih dari 100 karakter.').regex(/^[a-zA-Z0-9\s.,&'-]+$/, 'Nama properti hanya boleh mengandung huruf, angka, spasi, koma, titik, ampersand (&), dan tanda hubung (-).'),
  categoryId: z.string().min(1, 'Silakan pilih kategori properti terlebih dahulu.'),
  description: z.string().min(10, 'Deskripsi properti harus terdiri dari minimal 10 karakter.').max(1000, 'Deskripsi properti tidak boleh lebih dari 1000 karakter.'),
  city: z.string().min(1, 'Kota / Kabupaten harus dipilih.'),
  state: z.string().min(1, 'Provinsi harus dipilih.'),
  address: z.string().min(5, 'Alamat lengkap harus terdiri dari minimal 5 karakter.').max(150, 'Alamat lengkap tidak boleh lebih dari 150 karakter.'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
type Category = { id: string; name: string };

function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetch('/api/categories/tenant/categories?limit=100').then((res) => res.json()).then((json) => setCategories(json.data?.items || json.data || [])).catch(() => toast.error('Gagal memuat kategori'));
  }, []);
  return categories;
}

export default function PropertyForm({ initialData, onSuccess, onCancel }: {
  initialData?: PropertyFormInitData;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const categories = useCategories();
  const [files, setFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(initialData?.images?.[0]?.id || null);
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<{ lat: number; lng: number } | null>(
    initialData?.latitude && initialData?.longitude ? { lat: initialData.latitude, lng: initialData.longitude } : null
  );

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId || initialData?.category?.id || '',
      description: initialData?.description || '',
      city: initialData?.city || '',
      state: initialData?.province || '',
      address: initialData?.address || '',
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
    },
  });

  const [nameValue, setNameValue] = useState(initialData?.name || '');
  const [descriptionValue, setDescriptionValue] = useState(initialData?.description || '');

  const handleSuggestionSelect = (s: { formatted: string; lat: number; lng: number }) => {
    setValue('address', s.formatted, { shouldValidate: true });
    setValue('latitude', s.lat);
    setValue('longitude', s.lng);
    setSelectedGeo({ lat: s.lat, lng: s.lng });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleMarkerDrag = async (lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
    setSelectedGeo({ lat, lng });
    try {
      const url = new URL('/api/geo/reverse', window.location.origin);
      url.searchParams.append('lat', lat.toString());
      url.searchParams.append('lng', lng.toString());
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success && json.data) setValue('address', json.data, { shouldValidate: true });
    } catch (err) {
      console.error('Failed to reverse geocode', err);
    }
  };

  const onSubmit = async (values: PropertyFormValues) => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(values).forEach(([k, v]) => { if (v !== undefined) data.append(k, String(v)); });
      files.forEach((f) => data.append('images', f));
      if (initialData && deletedImages.length > 0) data.append('deletedImages', JSON.stringify(deletedImages));
      if (mainImageId) data.append('mainImageId', mainImageId);
      if (mainImageIndex !== null) data.append('mainImageIndex', mainImageIndex.toString());
      const url = initialData ? `/api/properties/tenant/properties/${initialData.id}` : '/api/properties/tenant/properties';
      const res = await fetch(url, { method: initialData ? 'PATCH' : 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Terjadi kesalahan');
      toast.success(initialData ? 'Properti diperbarui' : 'Properti ditambahkan');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Nama Properti</label>
        <Input {...register('name')} maxLength={100} disabled={loading} className={errors.name ? 'border-destructive' : ''} />
        <div className="flex justify-between text-xs mt-1">
          {errors.name ? <span className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium"><span>⚠</span> {errors.name.message}</span> : <span className="text-muted-foreground">Minimal 3 karakter, tanpa karakter khusus.</span>}
          <span className={`text-muted-foreground ${nameValue.length > 100 ? 'text-destructive font-medium' : ''}`}>{nameValue.length} / 100</span>
        </div>
        <input type="hidden" value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm mb-1">Kategori</label>
        <Controller name="categoryId" control={control} render={({ field }) => (
          <select {...field} disabled={loading} className={`w-full h-9 rounded border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.categoryId ? 'border-destructive' : ''}`}>
            <option value="">Pilih...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )} />
        {errors.categoryId && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium"><span>⚠</span> {errors.categoryId.message}</p>}
      </div>

      <div>
        <label className="block text-sm mb-1">Deskripsi</label>
        <textarea {...register('description')} maxLength={1000} disabled={loading} onChange={(e) => { register('description').onChange(e); setDescriptionValue(e.target.value); }} className={`w-full min-h-20 rounded border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.description ? 'border-destructive' : ''}`} />
        <div className="flex justify-between text-xs mt-1">
          {errors.description ? <span className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium"><span>⚠</span> {errors.description.message}</span> : <span className="text-muted-foreground">Jelaskan fasilitas dan keunggulan.</span>}
          <span className={`text-muted-foreground ${descriptionValue.length > 1000 ? 'text-destructive font-medium' : ''}`}>{descriptionValue.length} / 1000</span>
        </div>
      </div>

      <PropertyFormLocation
        control={control} errors={errors} loading={loading} initialData={initialData}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        showSuggestions={showSuggestions} setShowSuggestions={setShowSuggestions}
        selectedGeo={selectedGeo}
        handleSuggestionSelect={handleSuggestionSelect} handleMarkerDrag={handleMarkerDrag}
      />

      <PropertyFormImages
        initialData={initialData} files={files} setFiles={setFiles}
        deletedImages={deletedImages} setDeletedImages={setDeletedImages}
        mainImageId={mainImageId} setMainImageId={setMainImageId}
        mainImageIndex={mainImageIndex} setMainImageIndex={setMainImageIndex}
        loading={loading}
      />

      <div className="flex justify-end space-x-2 pt-4 border-t">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Batal</Button>}
        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </form>
  );
}
