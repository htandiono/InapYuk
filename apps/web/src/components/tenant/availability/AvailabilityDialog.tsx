import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAvailability } from './useAvailability';
import { AvailabilityForm } from './AvailabilityForm';

type AvailabilityDialogProps = {
  roomId: string | null;
  onClose: () => void;
};

export function AvailabilityDialog({ roomId, onClose }: AvailabilityDialogProps) {
  const { loading, updateAvailability } = useAvailability(roomId, onClose);

  return (
    <Dialog open={!!roomId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kelola Ketersediaan</DialogTitle>
        </DialogHeader>
        <AvailabilityForm
          loading={loading}
          onSubmit={updateAvailability}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
