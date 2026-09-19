'use client';
import { Input } from '@/components/ui/input';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { PropertyFormValues } from './property-schema';

interface Props {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  nameValue: string;
  descriptionValue: string;
  categories: { id: string; name: string }[];
}

export function PropertyBasicFields({
  control,
  errors,
  loading,
  nameValue,
  descriptionValue,
  categories,
}: Props) {
  return (
    <>
      <NameField control={control} errors={errors} loading={loading} nameValue={nameValue} />
      <CategoryField control={control} errors={errors} loading={loading} categories={categories} />
      <DescriptionField
        control={control}
        errors={errors}
        loading={loading}
        descriptionValue={descriptionValue}
      />
    </>
  );
}

function NameField({
  control,
  errors,
  loading,
  nameValue,
}: {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  nameValue: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">Nama Properti</label>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            maxLength={100}
            disabled={loading}
            className={errors.name ? 'border-destructive' : ''}
          />
        )}
      />
      <div className="flex justify-between text-xs mt-1">
        {errors.name ? (
          <span className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium">
            <span>⚠</span> {errors.name.message}
          </span>
        ) : (
          <span className="text-muted-foreground">Minimal 3 karakter, tanpa karakter khusus.</span>
        )}
        <span
          className={`text-muted-foreground ${nameValue.length > 100 ? 'text-destructive font-medium' : ''}`}
        >
          {nameValue.length} / 100
        </span>
      </div>
    </div>
  );
}

function CategoryField({
  control,
  errors,
  loading,
  categories,
}: {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  categories: { id: string; name: string }[];
}) {
  return (
    <div>
      <label className="block text-sm mb-1">Kategori</label>
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <select
            {...field}
            disabled={loading}
            className={`w-full h-9 rounded border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.categoryId ? 'border-destructive' : ''}`}
          >
            <option value="">Pilih...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      />
      {errors.categoryId && (
        <p className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium">
          <span>⚠</span> {errors.categoryId.message}
        </p>
      )}
    </div>
  );
}

function DescriptionField({
  control,
  errors,
  loading,
  descriptionValue,
}: {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  descriptionValue: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">Deskripsi</label>
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            maxLength={1000}
            disabled={loading}
            className={`w-full min-h-20 rounded border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.description ? 'border-destructive' : ''}`}
          />
        )}
      />
      <div className="flex justify-between text-xs mt-1">
        {errors.description ? (
          <span className="text-destructive text-xs mt-1.5 flex items-center gap-1.5 font-medium">
            <span>⚠</span> {errors.description.message}
          </span>
        ) : (
          <span className="text-muted-foreground">Jelaskan fasilitas dan keunggulan.</span>
        )}
        <span
          className={`text-muted-foreground ${descriptionValue.length > 1000 ? 'text-destructive font-medium' : ''}`}
        >
          {descriptionValue.length} / 1000
        </span>
      </div>
    </div>
  );
}
