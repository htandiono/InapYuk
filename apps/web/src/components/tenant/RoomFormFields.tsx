import { Input } from '@/components/ui/input';
import { useWatch } from 'react-hook-form';
import { RoomFormData } from './RoomFormSchema';
import { UseFormReturn } from 'react-hook-form';

export function RoomFormFields({ form }: { form: UseFormReturn<RoomFormData> }) {
  return (
    <>
      <NameField form={form} />
      <DescriptionField form={form} />
      <div className="grid grid-cols-2 gap-4">
        <NumberField form={form} name="basePrice" label="Harga per Malam" />
        <NumberField form={form} name="capacity" label="Kapasitas (Orang)" />
        <NumberField form={form} name="totalUnits" label="Total Unit Kamar" />
      </div>
    </>
  );
}

function NameField({ form }: { form: UseFormReturn<RoomFormData> }) {
  const {
    register,
    formState: { errors, isSubmitting },
    control,
  } = form;
  const val = useWatch({ control, name: 'name', defaultValue: '' });
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Nama</label>
      <Input
        {...register('name')}
        disabled={isSubmitting}
        maxLength={100}
        className={errors.name ? 'border-destructive' : ''}
      />
      <div className="flex justify-between text-xs mt-1">
        {errors.name ? (
          <span className="text-destructive font-medium">⚠ {errors.name.message as string}</span>
        ) : (
          <span className="text-muted-foreground">Minimal 3 karakter.</span>
        )}
        <span
          className={val.length > 100 ? 'text-destructive font-medium' : 'text-muted-foreground'}
        >
          {val.length} / 100
        </span>
      </div>
    </div>
  );
}

function DescriptionField({ form }: { form: UseFormReturn<RoomFormData> }) {
  const {
    register,
    formState: { errors, isSubmitting },
    control,
  } = form;
  const val = useWatch({ control, name: 'description', defaultValue: '' });
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Deskripsi</label>
      <textarea
        {...register('description')}
        disabled={isSubmitting}
        maxLength={1000}
        className={`w-full min-h-20 rounded border border-input px-3 py-2 text-sm bg-transparent ${errors.description ? 'border-destructive' : ''}`}
      />
      <div className="flex justify-between text-xs mt-1">
        {errors.description ? (
          <span className="text-destructive font-medium">
            ⚠ {errors.description.message as string}
          </span>
        ) : (
          <span className="text-muted-foreground">Fasilitas dan keunggulan.</span>
        )}
        <span
          className={val.length > 1000 ? 'text-destructive font-medium' : 'text-muted-foreground'}
        >
          {val.length} / 1000
        </span>
      </div>
    </div>
  );
}

function NumberField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<RoomFormData>;
  name: keyof RoomFormData;
  label: string;
}) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Input
        type="number"
        {...register(name, { valueAsNumber: true })}
        disabled={isSubmitting}
        min="1"
      />
      {errors[name] && (
        <p className="text-xs text-destructive mt-1">⚠ {errors[name].message as string}</p>
      )}
    </div>
  );
}
