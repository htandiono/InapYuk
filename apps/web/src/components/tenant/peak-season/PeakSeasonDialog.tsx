import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect } from 'react';
import { usePeakSeasonRates } from './usePeakSeasonRates';
import { PeakSeasonForm } from './PeakSeasonForm';
import { PeakSeasonList } from './PeakSeasonList';
import { PeakRate } from './types';

type PeakSeasonDialogProps = {
  roomId: string | null;
  onClose: () => void;
};

type ListSectionProps = {
  rates: PeakRate[];
  fetching: boolean;
  onDelete: (id: string) => void;
};

function PeakSeasonListSection({ rates, fetching, onDelete }: ListSectionProps) {
  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-3">Daftar Harga Musiman</h4>
      <PeakSeasonList rates={rates} fetching={fetching} onDelete={onDelete} />
    </div>
  );
}

function usePeakSeasonDialog(roomId: string | null) {
  const { fetchRates, ...rest } = usePeakSeasonRates(roomId);
  useEffect(() => {
    if (roomId) void fetchRates();
  }, [roomId, fetchRates]);
  return { fetchRates, ...rest };
}

export function PeakSeasonDialog({ roomId, onClose }: PeakSeasonDialogProps) {
  const { rates, fetching, loading, addRate, deleteRate } = usePeakSeasonDialog(roomId);
  return (
    <Dialog open={!!roomId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-xl max-h-[90vh] overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Harga Musiman</DialogTitle>
        </DialogHeader>
        <PeakSeasonForm rates={rates} loading={loading} onSubmit={addRate} />
        <PeakSeasonListSection rates={rates} fetching={fetching} onDelete={deleteRate} />
      </DialogContent>
    </Dialog>
  );
}
