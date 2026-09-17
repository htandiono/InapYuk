import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAvailability } from './useAvailability';
import { AvailabilityForm } from './AvailabilityForm';

type AvailabilityDialogProps = {
  roomId: string | null;
  totalUnits?: number;
  onClose: () => void;
};

export function AvailabilityDialog({ roomId, totalUnits, onClose }: AvailabilityDialogProps) {
  const { loading, updateAvailability } = useAvailability(roomId, onClose);
  return (
    <Dialog open={!!roomId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-md min-w-[320px]">
        <DialogHeader><DialogTitle>Kelola Ketersediaan</DialogTitle></DialogHeader>
        <AvailabilityForm loading={loading} totalUnits={totalUnits} onSubmit={updateAvailability} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
