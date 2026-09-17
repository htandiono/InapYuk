import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect } from 'react';
import { usePeakSeasonRates } from './usePeakSeasonRates';
import { PeakSeasonForm } from './PeakSeasonForm';
import { PeakSeasonList } from './PeakSeasonList';

type PeakSeasonDialogProps = {
  roomId: string | null;
  onClose: () => void;
};

export function PeakSeasonDialog({ roomId, onClose }: PeakSeasonDialogProps) {
  const { rates, fetching, loading, fetchRates, addRate, deleteRate } = usePeakSeasonRates(roomId);
  useEffect(() => { if (roomId) void fetchRates(); }, [roomId, fetchRates]);
  return (
    <Dialog open={!!roomId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Kelola Harga Musiman</DialogTitle></DialogHeader>
        <PeakSeasonForm rates={rates} loading={loading} onSubmit={addRate} />
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Daftar Harga Musiman</h4><PeakSeasonList rates={rates} fetching={fetching} onDelete={deleteRate} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
