import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { PeakRate } from './types';

type PeakSeasonListProps = {
  rates: PeakRate[];
  fetching: boolean;
  onDelete: (id: string) => void;
};

export function PeakSeasonList({ rates, fetching, onDelete }: PeakSeasonListProps) {
  if (fetching) {
    return <p className="text-sm text-muted-foreground text-center py-4">Memuat...</p>;
  }

  if (rates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
        Belum ada harga musiman
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rates.map((rate) => (
        <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
          <div>
            <p className="font-semibold text-sm">{rate.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(rate.startDate).toLocaleDateString('id-ID')} -{' '}
              {new Date(rate.endDate).toLocaleDateString('id-ID')}
            </p>
            <p className="text-xs font-medium text-primary mt-1">
              {rate.adjustmentType === 'NOMINAL'
                ? `+ Rp ${Number(rate.adjustmentValue).toLocaleString('id-ID')}`
                : `+ ${rate.adjustmentValue}%`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(rate.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
