'use client';
import { Input } from '@/components/ui/input';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { PropertyFormValues } from './property-schema';

interface Props {
  control: Control<PropertyFormValues>;
  errors: FieldErrors<PropertyFormValues>;
  loading: boolean;
  addressValue: string;
}

export function StreetAddressField({ control, errors, loading, addressValue }: Props) {
  return (
    <div className="pt-2">
      <StreetAddressLabel />
      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            maxLength={150}
            disabled={loading}
            placeholder="Nama jalan, nomor, gedung..."
            className={errors.address ? 'border-destructive' : ''}
          />
        )}
      />
      <StreetAddressFooter errors={errors} addressValue={addressValue} />
    </div>
  );
}

function StreetAddressLabel() {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
      Alamat Lengkap <span className="text-destructive">*</span>
    </label>
  );
}

function StreetAddressFooter({ errors, addressValue }: { errors: any; addressValue: string }) {
  return (
    <div className="flex justify-between text-xs mt-1">
      {errors.address ? (
        <span className="flex items-center gap-1 text-destructive text-xs mt-1.5">
          <span>⚠</span> {errors.address.message}
        </span>
      ) : (
        <span className="text-muted-foreground">Gunakan alamat lengkap properti Anda.</span>
      )}
      <span
        className={`text-muted-foreground ${addressValue.length > 150 ? 'text-destructive font-medium' : ''}`}
      >
        {addressValue.length} / 150
      </span>
    </div>
  );
}
