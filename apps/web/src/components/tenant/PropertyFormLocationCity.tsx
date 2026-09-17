import { Controller, Control, FieldErrors } from 'react-hook-form';
import type { PropertyFormValues } from './PropertyFormNew';

interface CitySelectProps {
  selectedProvinceId: string;
  availableCities: string[];
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
}

export function CitySelect({
  selectedProvinceId,
  availableCities,
  control,
  errors,
  loading,
}: CitySelectProps) {
  return (
    <div>
      <label
        className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${selectedProvinceId ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}
      >
        Kota / Kabupaten <span className="text-destructive">*</span>
      </label>
      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <div className="relative">
            <select
              {...field}
              disabled={loading || !selectedProvinceId}
              className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/30 ${errors.city ? 'border-destructive ring-1 ring-destructive' : 'border-input hover:border-primary/50'} ${!selectedProvinceId ? 'border-dashed' : ''}`}
            >
              <option value="">
                {selectedProvinceId
                  ? 'Pilih Kota / Kabupaten...'
                  : '← Pilih provinsi terlebih dahulu'}
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
        )}
      />
      {errors.city && (
        <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
          <span>⚠</span> {errors.city.message}
        </p>
      )}
      {!selectedProvinceId && !errors.city && (
        <p className="text-xs text-muted-foreground/70 mt-1.5">
          Pilih provinsi untuk mengaktifkan pilihan kota.
        </p>
      )}
    </div>
  );
}
