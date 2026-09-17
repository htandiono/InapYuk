import { PROVINCES } from '@/data/indonesia-regions';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import type { PropertyFormValues } from './PropertyFormNew';

interface ProvinceSelectProps {
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
}

export function ProvinceSelect({
  selectedProvinceId,
  setSelectedProvinceId,
  control,
  errors,
  loading,
}: ProvinceSelectProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
        Provinsi <span className="text-destructive">*</span>
      </label>
      <Controller
        name="state"
        control={control}
        render={({ field }) => (
          <select
            value={selectedProvinceId}
            disabled={loading}
            onChange={(e) => {
              const province = PROVINCES.find((p) => p.id === e.target.value);
              setSelectedProvinceId(e.target.value);
              field.onChange(province?.name ?? '');
            }}
            className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${errors.state ? 'border-destructive ring-1 ring-destructive' : 'border-input hover:border-primary/50'}`}
          >
            <option value="">Pilih Provinsi...</option>
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      />
      {errors.state && (
        <p className="flex items-center gap-1 text-destructive text-xs mt-1.5">
          <span>⚠</span> {errors.state.message}
        </p>
      )}
    </div>
  );
}
