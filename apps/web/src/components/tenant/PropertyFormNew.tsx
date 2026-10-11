'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PropertyFormImages } from './PropertyFormImage';
import { PropertyFormLocation } from './PropertyFormLocation';
import { PropertyFormFields } from './PropertyFormFields';
import { PropertyFormActions } from './PropertyFormActions';
import type { PropertyFormInitData } from './property-schema';
import { usePropertyFormLogic } from './usePropertyFormLogic';

export type { PropertyFormInitData, PropertyFormValues } from './property-schema';

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
  const logic = usePropertyFormLogic(initialData, onSuccess);
  const [nameValue, setNameValue] = useState(initialData?.name || '');
  const [descValue, setDescValue] = useState(initialData?.description || '');

  return (
    <>
      <PropertyFormFields
        control={logic.form.control}
        errors={logic.form.formState.errors}
        loading={logic.loading}
        nameValue={nameValue}
        descriptionValue={descValue}
        onNameChange={setNameValue}
        onDescChange={setDescValue}
        categories={categories}
      />
      <PropertyFormLocation
        control={logic.form.control}
        errors={logic.form.formState.errors}
        loading={logic.loading}
        selectedProvinceId={logic.selectedProvinceId}
        setSelectedProvinceId={logic.setSelectedProvinceId}
        searchQuery={logic.searchQuery}
        setSearchQuery={logic.setSearchQuery}
        showSuggestions={logic.showSuggestions}
        setShowSuggestions={logic.setShowSuggestions}
        selectedGeo={logic.selectedGeo}
        handleSuggestionSelect={logic.handleSuggestionSelect}
        handleMarkerDrag={logic.geo.handleMarkerDrag}
      />
      <PropertyFormImages hook={logic.imgHook} loading={logic.loading} />
      <PropertyFormActions
        loading={logic.loading}
        onCancel={onCancel}
        onSubmit={logic.form.handleSubmit(logic.onSubmit)}
      />
    </>
  );
}
