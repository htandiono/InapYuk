'use client';

import { getProvinceIdByName } from '@/data/indonesia-regions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { matchCity } from './geocoding-utils';
import { buildFormData, submitPropertyForm } from './property-form-submit';
import {
  propertySchema,
  type PropertyFormInitData,
  type PropertyFormValues,
} from './property-schema';
import { useGeocodingEffects } from './useGeocodingEffects';
import { usePropertyFormImages } from './usePropertyFormImages';

type Geo = { lat: number; lng: number };
type Suggestion = Geo & { formatted: string };

function getDefaultValues(data?: PropertyFormInitData): PropertyFormValues {
  const provinceId = getProvinceIdByName(data?.province ?? '') ?? '';
  return {
    name: data?.name || '',
    categoryId: data?.categoryId || data?.category?.id || '',
    description: data?.description || '',
    // Seed data stores "Bantul" while the dropdown lists "Kabupaten Bantul".
    city: matchCity(provinceId, data?.city ?? '') ?? data?.city ?? '',
    state: data?.province || '',
    address: data?.address || '',
    latitude: data?.latitude || undefined,
    longitude: data?.longitude || undefined,
  };
}

function useInitialLocation(data?: PropertyFormInitData) {
  const hasGeo = Boolean(data?.latitude && data?.longitude);
  const initialGeo = hasGeo ? { lat: data!.latitude!, lng: data!.longitude! } : null;
  const [provinceId, setProvinceId] = useState(getProvinceIdByName(data?.province ?? '') ?? '');
  const [selectedGeo, setSelectedGeo] = useState<Geo | null>(initialGeo);
  return { provinceId, setProvinceId, selectedGeo, setSelectedGeo, hasGeo };
}

function useLocationWatch(form: UseFormReturn<PropertyFormValues>) {
  const addressValue = useWatch({ control: form.control, name: 'address' }) || '';
  const watchedCity = useWatch({ control: form.control, name: 'city' }) || '';
  return { addressValue, watchedCity };
}

function useLocationSync(form: UseFormReturn<PropertyFormValues>, data?: PropertyFormInitData) {
  const loc = useInitialLocation(data);
  const geo = useGeocodingEffects({
    ...useLocationWatch(form),
    selectedProvinceId: loc.provinceId,
    setSelectedProvinceId: loc.setProvinceId,
    setSelectedGeo: loc.setSelectedGeo,
    setValue: form.setValue,
    // A saved pin must not be replaced by a fresh geocode of the same address.
    initialAddress: loc.hasGeo ? data?.address : undefined,
  });
  const { provinceId, setProvinceId, selectedGeo } = loc;
  return { selectedProvinceId: provinceId, setSelectedProvinceId: setProvinceId, selectedGeo, geo };
}

function useSearchState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const reset = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };
  return { searchQuery, setSearchQuery, showSuggestions, setShowSuggestions, reset };
}

function useSuggestionSelect(
  form: UseFormReturn<PropertyFormValues>,
  geo: ReturnType<typeof useLocationSync>['geo'],
) {
  const search = useSearchState();
  const handleSuggestionSelect = (s: Suggestion) => {
    form.setValue('address', s.formatted, { shouldValidate: true });
    /* eslint-disable-next-line react-hooks/immutability */
    geo.lastGeocodedAddressRef.current = s.formatted;
    geo.handleMarkerDrag(s.lat, s.lng, s.formatted);
    search.reset();
  };
  return { ...search, handleSuggestionSelect };
}

async function savePropertyForm(
  values: PropertyFormValues,
  imgHook: ReturnType<typeof usePropertyFormImages>,
  initialData?: PropertyFormInitData,
  onSuccess?: () => void,
) {
  try {
    await submitPropertyForm(buildFormData(values, imgHook, initialData), initialData);
    toast.success(initialData ? 'Properti diperbarui' : 'Properti ditambahkan');
    onSuccess?.();
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : String(err));
  }
}

function usePropertySubmit(
  imgHook: ReturnType<typeof usePropertyFormImages>,
  initialData?: PropertyFormInitData,
  onSuccess?: () => void,
) {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (values: PropertyFormValues) => {
    setLoading(true);
    await savePropertyForm(values, imgHook, initialData, onSuccess);
    setLoading(false);
  };
  return { loading, onSubmit };
}

export function usePropertyFormLogic(initialData?: PropertyFormInitData, onSuccess?: () => void) {
  const imgHook = usePropertyFormImages(initialData);
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: getDefaultValues(initialData),
  });
  const location = useLocationSync(form, initialData);
  const suggest = useSuggestionSelect(form, location.geo);
  const submit = usePropertySubmit(imgHook, initialData, onSuccess);
  return { form, imgHook, ...location, ...suggest, ...submit };
}
