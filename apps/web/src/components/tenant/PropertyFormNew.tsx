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
type Logic = ReturnType<typeof usePropertyFormLogic>;

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

function useTextValues(initialData?: PropertyFormInitData) {
  const [nameValue, onNameChange] = useState(initialData?.name || '');
  const [descriptionValue, onDescChange] = useState(initialData?.description || '');
  return { nameValue, onNameChange, descriptionValue, onDescChange };
}

interface BasicProps {
  logic: Logic;
  categories: Category[];
  initialData?: PropertyFormInitData;
}

function BasicSection({ logic, categories, initialData }: BasicProps) {
  const text = useTextValues(initialData);
  const { control, formState } = logic.form;
  return (
    <PropertyFormFields
      {...text}
      control={control}
      errors={formState.errors}
      loading={logic.loading}
      categories={categories}
    />
  );
}

function LocationSection({ logic }: { logic: Logic }) {
  const { control, formState } = logic.form;
  return (
    <PropertyFormLocation
      {...logic}
      control={control}
      errors={formState.errors}
      handleMarkerDrag={logic.geo.handleMarkerDrag}
    />
  );
}

function ActionsSection({ logic, onCancel }: { logic: Logic; onCancel?: () => void }) {
  const onSubmit = logic.form.handleSubmit(logic.onSubmit);
  return <PropertyFormActions loading={logic.loading} onCancel={onCancel} onSubmit={onSubmit} />;
}

interface FormProps {
  initialData?: PropertyFormInitData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PropertyForm({ initialData, onSuccess, onCancel }: FormProps) {
  const categories = useCategories();
  const logic = usePropertyFormLogic(initialData, onSuccess);
  return (
    <>
      <BasicSection logic={logic} categories={categories} initialData={initialData} />
      <LocationSection logic={logic} />
      <PropertyFormImages hook={logic.imgHook} loading={logic.loading} />
      <ActionsSection logic={logic} onCancel={onCancel} />
    </>
  );
}
