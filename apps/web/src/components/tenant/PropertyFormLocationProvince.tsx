import { PROVINCES } from '@/data/indonesia-regions';
import { Controller, Control, FieldErrors, ControllerRenderProps } from 'react-hook-form';
import { FieldError } from './FieldParts';
import type { PropertyFormValues } from './property-schema';
import { selectClass } from './select-styles';

interface ProvinceSelectProps {
  selectedProvinceId: string;
  setSelectedProvinceId: (id: string) => void;
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
}

type InputProps = ProvinceSelectProps & {
  field: ControllerRenderProps<PropertyFormValues, 'state'>;
};

function ProvinceOptions() {
  return (
    <>
      <option value="">Pilih Provinsi...</option>
      {PROVINCES.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </>
  );
}

function ProvinceSelectInput(p: InputProps) {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    p.setSelectedProvinceId(e.target.value);
    p.field.onChange(PROVINCES.find((x) => x.id === e.target.value)?.name ?? '');
  };
  const className = selectClass(Boolean(p.errors.state), 'disabled:opacity-50');
  const props = { value: p.selectedProvinceId, disabled: p.loading, onChange, className };
  return (
    <select {...props}>
      <ProvinceOptions />
    </select>
  );
}

export function ProvinceSelect(p: ProvinceSelectProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
        Provinsi <span className="text-destructive">*</span>
      </label>
      <Controller
        name="state"
        control={p.control}
        render={({ field }) => <ProvinceSelectInput {...p} field={field} />}
      />
      {p.errors.state && <FieldError message={p.errors.state.message} />}
    </div>
  );
}
