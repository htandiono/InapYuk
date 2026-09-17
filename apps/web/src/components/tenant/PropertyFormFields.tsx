'use client';

import { Controller, type Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import type { PropertyFormValues } from './PropertyFormNew';

interface PropertyFormFieldsProps {
  control: Control<PropertyFormValues>;
  errors: {
    name?: { message?: string };
    categoryId?: { message?: string };
    description?: { message?: string };
  };
  loading: boolean;
  nameValue: string;
  descriptionValue: string;
  onNameChange: (val: string) => void;
  onDescChange: (val: string) => void;
  categories: { id: string; name: string }[];
}

export function PropertyFormFields({
  control,
  errors,
  loading,
  nameValue,
  descriptionValue,
  onNameChange,
  onDescChange,
  categories,
}: PropertyFormFieldsProps) {
  return (
    <>
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
            <span className="text-muted-foreground">
              Minimal 3 karakter, tanpa karakter khusus.
            </span>
          )}
          <span
            className={`text-muted-foreground ${nameValue.length > 100 ? 'text-destructive font-medium' : ''}`}
          >
            {nameValue.length} / 100
          </span>
        </div>
        <input type="hidden" value={nameValue} onChange={(e) => onNameChange(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm mb-1">Kategori</label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              disabled={loading}
              className={`w-full h-9 rounded border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                errors.categoryId ? 'border-destructive' : ''
              }`}
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
              onChange={(e) => {
                onDescChange(e.target.value);
                field.onChange(e);
              }}
              className={`w-full min-h-20 rounded border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                errors.description ? 'border-destructive' : ''
              }`}
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
    </>
  );
}
