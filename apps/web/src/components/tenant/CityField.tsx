'use client';
import { PROVINCES } from '@/data/indonesia-regions';
import { api } from '@/lib/api-client';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { PropertyFormValues } from './property-schema';

interface Props {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  selectedProvinceId: string;
  availableCities: string[];
  setSelectedGeo: (geo: { lat: number; lng: number } | null) => void;
  setValue: UseFormSetValue<PropertyFormValues>;
}

export function CityField({
  control,
  errors,
  loading,
  selectedProvinceId,
  availableCities,
  setSelectedGeo,
  setValue,
}: Props) {
  return (
    <div>
      <CityLabel selectedProvinceId={selectedProvinceId} />
      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <CitySelect
            field={field}
            loading={loading}
            selectedProvinceId={selectedProvinceId}
            errors={errors}
            availableCities={availableCities}
            onChange={(val) => {
              field.onChange(val);
              if (val && selectedProvinceId) {
                void geocodeCity(selectedProvinceId, val, setSelectedGeo, setValue);
              }
            }}
          />
        )}
      />
      <CityError errors={errors} selectedProvinceId={selectedProvinceId} />
    </div>
  );
}

function CityLabel({ selectedProvinceId }: { selectedProvinceId: string }) {
  return (
    <label
      className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${selectedProvinceId ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}
    >
      Kota / Kabupaten <span className="text-destructive">*</span>
    </label>
  );
}

async function geocodeCity(
  provinceId: string,
  cityVal: string,
  setSelectedGeo: (g: { lat: number; lng: number } | null) => void,
  setValue: UseFormSetValue<PropertyFormValues>,
) {
  const provinceName = PROVINCES.find((p) => p.id === provinceId)?.name;
  if (!provinceName) return;
  const params = new URLSearchParams({ q: `${cityVal}, ${provinceName}, Indonesia` });
  try {
    const data = await api.get<{ formatted: string; lat: number; lng: number }[]>(
      `/geo/autocomplete?${params}`,
    );
    if (data && data.length > 0) {
      const first = data[0];
      setSelectedGeo({ lat: first.lat, lng: first.lng });
      setValue('latitude', first.lat);
      setValue('longitude', first.lng);
    }
  } catch {
    console.error('City geocoding failed');
  }
}

function CitySelect({
  field,
  loading,
  selectedProvinceId,
  errors,
  availableCities,
  onChange,
}: {
  field: {
    value: string;
    onChange: (v: string) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLSelectElement>;
  };
  loading: boolean;
  selectedProvinceId: string;
  errors: FieldErrors<PropertyFormValues>;
  availableCities: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={field.value}
        disabled={loading || !selectedProvinceId}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/30 ${errors?.city ? 'border-destructive ring-1 ring-destructive' : 'border-input hover:border-primary/50'} ${!selectedProvinceId ? 'border-dashed' : ''}`}
      >
        <option value="">
          {selectedProvinceId ? 'Pilih Kota / Kabupaten...' : '← Pilih provinsi terlebih dahulu'}
        </option>
        {availableCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      {!selectedProvinceId && (
        <div
          className="absolute inset-0 rounded-md cursor-not-allowed"
          title="Pilih provinsi terlebih dahulu"
        />
      )}
    </div>
  );
}

function CityError({ errors, selectedProvinceId }: { errors: FieldErrors<PropertyFormValues>; selectedProvinceId: string }) {
  if (errors?.city) {
    return (
      <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
        <span>⚠</span> {errors.city.message}
      </p>
    );
  }
  if (!selectedProvinceId) {
    return (
      <p className="text-xs text-muted-foreground/70 mt-1.5">
        Pilih provinsi untuk mengaktifkan pilihan kota.
      </p>
    );
  }
  return null;
}
