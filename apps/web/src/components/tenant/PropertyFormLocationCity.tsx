import { Controller, Control, FieldErrors, ControllerRenderProps } from 'react-hook-form';
import { FieldError } from './FieldParts';
import type { PropertyFormValues } from './property-schema';
import { selectClass } from './select-styles';

interface CitySelectProps {
  selectedProvinceId: string;
  availableCities: string[];
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
}

type InputProps = CitySelectProps & { field: ControllerRenderProps<PropertyFormValues, 'city'> };

function CityOptions({ province, cities }: { province: string; cities: string[] }) {
  return (
    <>
      <option value="">
        {province ? 'Pilih Kota / Kabupaten...' : '← Pilih provinsi terlebih dahulu'}
      </option>
      {cities.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </>
  );
}

function CityGuard() {
  const title = 'Pilih provinsi terlebih dahulu';
  return <div className="absolute inset-0 rounded-md cursor-not-allowed" title={title} />;
}

function CitySelectInput(p: InputProps) {
  const dashed = p.selectedProvinceId ? '' : 'border-dashed';
  const className = selectClass(
    Boolean(p.errors.city),
    `disabled:opacity-40 disabled:bg-muted/30 ${dashed}`,
  );
  return (
    <div className="relative">
      <select {...p.field} disabled={p.loading || !p.selectedProvinceId} className={className}>
        <CityOptions province={p.selectedProvinceId} cities={p.availableCities} />
      </select>
      {!p.selectedProvinceId && <CityGuard />}
    </div>
  );
}

function CitySelectFeedback(p: CitySelectProps) {
  if (p.errors.city) return <FieldError message={p.errors.city.message} />;
  if (p.selectedProvinceId) return null;
  return (
    <p className="text-xs text-muted-foreground/70 mt-1.5">
      Pilih provinsi untuk mengaktifkan pilihan kota.
    </p>
  );
}

function CityLabel({ active }: { active: boolean }) {
  const dim = active ? 'text-muted-foreground' : 'text-muted-foreground/50';
  return (
    <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${dim}`}>
      Kota / Kabupaten <span className="text-destructive">*</span>
    </label>
  );
}

export function CitySelect(p: CitySelectProps) {
  return (
    <div>
      <CityLabel active={Boolean(p.selectedProvinceId)} />
      <Controller
        name="city"
        control={p.control}
        render={({ field }) => <CitySelectInput {...p} field={field} />}
      />
      <CitySelectFeedback {...p} />
    </div>
  );
}
