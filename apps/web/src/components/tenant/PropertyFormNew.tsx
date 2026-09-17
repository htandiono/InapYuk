'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { PropertyFormImages } from './PropertyFormImage';
import { usePropertyFormImages } from './usePropertyFormImages';
import { PropertyFormLocation } from './PropertyFormLocation';
import { PropertyFormFields } from './PropertyFormFields';
import { PropertyFormActions } from './PropertyFormActions';

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
  name: z
    .string()
    .min(3, 'Nama properti harus terdiri dari minimal 3 karakter.')
    .max(100, 'Nama properti tidak boleh lebih dari 100 karakter.')
    .regex(
      /^[a-zA-Z0-9\s.,&'-]+$/,
      'Nama properti hanya boleh mengandung huruf, angka, spasi, koma, titik, ampersand (&), dan tanda hubung (-).',
    ),
  categoryId: z.string().min(1, 'Silakan pilih kategori properti terlebih dahulu.'),
  description: z
    .string()
    .min(10, 'Deskripsi properti harus terdiri dari minimal 10 karakter.')
    .max(1000, 'Deskripsi properti tidak boleh lebih dari 1000 karakter.'),
  city: z.string().min(1, 'Kota / Kabupaten harus dipilih.'),
  state: z.string().min(1, 'Provinsi harus dipilih.'),
  address: z
    .string()
    .min(5, 'Alamat lengkap harus terdiri dari minimal 5 karakter.')
    .max(150, 'Alamat lengkap tidak boleh lebih dari 150 karakter.'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
type Category = { id: string; name: string };

function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetch('/api/categories/tenant/categories?limit=100')
      .then((res) => res.json())
      .then((json) => setCategories(json.data?.items || json.data || []))
      .catch(() => toast.error('Gagal memuat kategori'));
  }, []);
  return categories;
}

export default function PropertyForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: PropertyFormInitData;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const categories = useCategories();
  const { files, deletedImages, mainImageId, mainImageIndex } = usePropertyFormImages(initialData);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<{ lat: number; lng: number } | null>(
    initialData?.latitude && initialData?.longitude
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null,
  );

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormValues>({
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
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined) data.append(k, String(v));
      });
      files.forEach((f) => data.append('images', f));
      if (initialData && deletedImages.length > 0)
        data.append('deletedImages', JSON.stringify(deletedImages));
      if (mainImageId) data.append('mainImageId', mainImageId);
      if (mainImageIndex !== null) data.append('mainImageIndex', mainImageIndex.toString());
      const url = initialData
        ? `/api/properties/tenant/properties/${initialData.id}`
        : '/api/properties/tenant/properties';
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
    <>
      <PropertyFormFields
        control={control}
        errors={errors}
        loading={loading}
        nameValue={nameValue}
        descriptionValue={descriptionValue}
        onNameChange={setNameValue}
        onDescChange={setDescriptionValue}
        categories={categories}
      />
      <PropertyFormLocation
        control={control}
        errors={errors}
        loading={loading}
        initialData={initialData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        selectedGeo={selectedGeo}
        handleSuggestionSelect={handleSuggestionSelect}
        handleMarkerDrag={handleMarkerDrag}
      />
      <PropertyFormImages initialData={initialData} loading={loading} />
      <PropertyFormActions
        loading={loading}
        onCancel={onCancel}
        onSubmit={handleSubmit(onSubmit)}
      />
    </>
  );
}
