'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { PropertyFormValues } from './property-schema';

interface Props {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  setValue: UseFormSetValue<PropertyFormValues>;
}

export function ProvinceField({
  control,
  errors,
  loading,
  selectedProvinceId,
  setSelectedProvinceId,
  setValue,
}: Props) {
  return (
    <div>
      <ProvinceLabel />
      <Controller
        name="state"
        control={control}
        render={({ field }) => (
          <ProvinceSelect
            value={selectedProvinceId}
            disabled={loading}
            errors={errors}
            onSelect={(id) => {
              setSelectedProvinceId(id);
              const province = PROVINCES.find((p) => p.id === id);
              field.onChange(province?.name ?? '');
              setValue('city', '');
              // Don't clear address here — let useProvinceCityGeocoder handle it
            }}
          />
        )}
      />
      <ProvinceError errors={errors} />
    </div>
  );
}

function ProvinceLabel() {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
      Provinsi <span className="text-destructive">*</span>
    </label>
  );
}

function ProvinceSelect({
  value,
  disabled,
  errors,
  onSelect,
}: {
  value: string;
  disabled: boolean;
  errors: any;
  onSelect: (id: string) => void;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onSelect(e.target.value)}
      className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.state ? 'border-destructive ring-1 ring-destructive' : 'border-input hover:border-primary/50'}`}
    >
      <option value="">Pilih Provinsi...</option>
      {PROVINCES.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

function ProvinceError({ errors }: { errors: any }) {
  if (!errors?.state) return null;
  return (
    <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
      <span>⚠</span> {errors.state.message}
    </p>
  );
}
