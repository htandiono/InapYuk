'use client';
import { Button } from '@/components/ui/button';
import { useRoomForm, submitForm, handleImageFiles } from './useRoomForm';
import { RoomFormInitData } from './RoomFormSchema';
import { RoomFormImages } from './RoomFormImages';
import { RoomFormFields } from './RoomFormFields';

export default function RoomForm({
  propertyId,
  initialData,
  onSuccess,
  onCancel,
}: {
  propertyId: string;
  initialData?: RoomFormInitData;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const state = useRoomForm(propertyId, initialData, onSuccess);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = state.form;
  return (
    <form onSubmit={handleSubmit((d) => submitForm(d, state))} className="space-y-4">
      <RoomFormImages
        state={state}
        previews={initialData?.images || []}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleImageFiles(e, state, initialData?.images?.length || 0)
        }
      />
      <RoomFormFields form={state.form} />
      <div className="flex justify-end space-x-2 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
