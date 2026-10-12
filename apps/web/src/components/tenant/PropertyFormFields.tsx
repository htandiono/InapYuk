'use client';

import { Controller, type Control, type ControllerRenderProps } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FieldError, FieldFooter } from './FieldParts';
import type { PropertyFormValues } from './property-schema';

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

const NAME_HINT = 'Minimal 3 karakter, tanpa karakter khusus.';
const DESC_HINT = 'Jelaskan fasilitas dan keunggulan.';
const SELECT_CLASS =
  'w-full h-9 rounded border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';
const TEXTAREA_CLASS =
  'w-full min-h-20 rounded border border-input bg-transparent px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

type WithField<K extends keyof PropertyFormValues> = PropertyFormFieldsProps & {
  field: ControllerRenderProps<PropertyFormValues, K>;
};

function NameInput(p: WithField<'name'>) {
  const error = p.errors.name ? 'border-destructive' : '';
  return <Input {...p.field} maxLength={100} disabled={p.loading} className={error} />;
}

function NameField(p: PropertyFormFieldsProps) {
  return (
    <div>
      <label className="block text-sm mb-1">Nama Properti</label>
      <Controller
        name="name"
        control={p.control}
        render={({ field }) => <NameInput {...p} field={field} />}
      />
      <FieldFooter error={p.errors.name?.message} hint={NAME_HINT} value={p.nameValue} max={100} />
      <input type="hidden" value={p.nameValue} onChange={(e) => p.onNameChange(e.target.value)} />
    </div>
  );
}

function CategorySelect(p: WithField<'categoryId'>) {
  const error = p.errors.categoryId ? 'border-destructive' : '';
  return (
    <select {...p.field} disabled={p.loading} className={`${SELECT_CLASS} ${error}`}>
      <option value="">Pilih...</option>
      {p.categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

function CategoryField(p: PropertyFormFieldsProps) {
  return (
    <div>
      <label className="block text-sm mb-1">Kategori</label>
      <Controller
        name="categoryId"
        control={p.control}
        render={({ field }) => <CategorySelect {...p} field={field} />}
      />
      {p.errors.categoryId && <FieldError message={p.errors.categoryId.message} />}
    </div>
  );
}

function DescriptionTextarea(p: WithField<'description'>) {
  const { field, onDescChange } = p;
  const error = p.errors.description ? 'border-destructive' : '';
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescChange(e.target.value);
    field.onChange(e);
  };
  const props = { ...field, maxLength: 1000, disabled: p.loading, onChange };
  return <textarea {...props} className={`${TEXTAREA_CLASS} ${error}`} />;
}

function DescriptionFooter(p: PropertyFormFieldsProps) {
  const error = p.errors.description?.message;
  return <FieldFooter error={error} hint={DESC_HINT} value={p.descriptionValue} max={1000} />;
}

function DescriptionField(p: PropertyFormFieldsProps) {
  return (
    <div>
      <label className="block text-sm mb-1">Deskripsi</label>
      <Controller
        name="description"
        control={p.control}
        render={({ field }) => <DescriptionTextarea {...p} field={field} />}
      />
      <DescriptionFooter {...p} />
    </div>
  );
}

export function PropertyFormFields(p: PropertyFormFieldsProps) {
  return (
    <>
      <NameField {...p} />
      <CategoryField {...p} />
      <DescriptionField {...p} />
    </>
  );
}
