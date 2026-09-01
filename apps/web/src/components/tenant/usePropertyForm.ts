'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { propertySchema, PropertyFormValues, PropertyFormInitData } from './property-schema';
import { useAddressSearch } from './useAddressSearch';
import { useGeocodingEffects } from './useGeocodingEffects';

export type { PropertyFormValues } from './property-schema';

export function usePropertyForm(initialData?: PropertyFormInitData) {
  const [files, setFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(
    initialData?.images?.[0]?.id || null,
  );
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const initialProvinceId = initialData?.province
    ? (PROVINCES.find((p) => p.name === initialData.province)?.id ?? '')
    : '';
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(initialProvinceId);
  const [selectedGeo, setSelectedGeo] = useState<{ lat: number; lng: number } | null>(
    initialData?.latitude && initialData?.longitude
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null,
  );

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: buildDefaultValues(initialData),
  });

  const descriptionValue = useWatch({
    control: form.control,
    name: 'description',
    defaultValue: initialData?.description || '',
  });
  const nameValue = useWatch({
    control: form.control,
    name: 'name',
    defaultValue: initialData?.name || '',
  });
  const addressValue = useWatch({
    control: form.control,
    name: 'address',
    defaultValue: initialData?.address || '',
  });
  const watchedCity = useWatch({
    control: form.control,
    name: 'city',
    defaultValue: initialData?.city || '',
  });

  // Debug log state
  const [debugLog, setDebugLog] = useState<{ time: string; msg: string }[]>([]);
  const addDebugLog = (msg: string) => {
    setDebugLog((prev) => [...prev.slice(-49), { time: new Date().toLocaleTimeString(), msg }]);
  };

  const search = useAddressSearch({ selectedProvinceId, watchedCity });
  const geo = useGeocodingEffects({
    addressValue,
    selectedProvinceId,
    setSelectedProvinceId,
    watchedCity,
    setSelectedGeo,
    setValue: form.setValue,
    addDebugLog,
  });

  const handleSuggestionSelect = (s: { formatted: string; lat: number; lng: number }) => {
    form.setValue('address', s.formatted, { shouldValidate: true });
    /* eslint-disable react-hooks/immutability */
    geo.lastGeocodedAddressRef.current = s.formatted;
    geo.handleMarkerDrag(s.lat, s.lng, s.formatted);
    search.setSearchQuery('');
    search.setShowSuggestions(false);
  };

  const onSubmit = async (values: PropertyFormValues) => {
    setLoading(true);
    try {
      const data = buildFormData(values, files, deletedImages, mainImageId, mainImageIndex);
      const url = initialData
        ? `/properties/tenant/properties/${initialData.id}`
        : '/properties/tenant/properties';
      if (initialData) {
        await api.patch(url, data);
      } else {
        await api.post(url, data);
      }
      toast.success(initialData ? 'Properti diperbarui' : 'Properti ditambahkan');
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    ...form,
    errors: form.formState.errors,
    loading,
    setLoading,
    files,
    setFiles,
    deletedImages,
    setDeletedImages,
    mainImageId,
    setMainImageId,
    mainImageIndex,
    setMainImageIndex,
    selectedProvinceId,
    setSelectedProvinceId,
    selectedGeo,
    setSelectedGeo,
    descriptionValue,
    nameValue,
    addressValue,
    watchedCity,
    ...search,
    ...geo,
    handleSuggestionSelect,
    onSubmit,
    debugLog,
    addDebugLog,
  };
}

function buildDefaultValues(data?: PropertyFormInitData): PropertyFormValues {
  return {
    name: data?.name || '',
    categoryId: data?.categoryId || data?.category?.id || '',
    description: data?.description || '',
    city: data?.city || '',
    state: data?.province || '',
    address: data?.address || '',
    latitude: data?.latitude || undefined,
    longitude: data?.longitude || undefined,
  };
}

function buildFormData(
  values: PropertyFormValues,
  files: File[],
  deletedImages: string[],
  mainImageId: string | null,
  mainImageIndex: number | null,
): FormData {
  const data = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined) data.append(k, String(v));
  });
  files.forEach((f) => data.append('images', f));
  if (deletedImages.length > 0) data.append('deletedImages', JSON.stringify(deletedImages));
  if (mainImageId) data.append('mainImageId', mainImageId);
  if (mainImageIndex !== null) data.append('mainImageIndex', mainImageIndex.toString());
  return data;
}
