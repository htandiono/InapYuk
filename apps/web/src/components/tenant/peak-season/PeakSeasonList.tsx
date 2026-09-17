import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { PeakRate } from './types';

type PeakSeasonListProps = {
  rates: PeakRate[];
  fetching: boolean;
  onDelete: (id: string) => void;
};

function RateDate({ rate }: { rate: PeakRate }) {
  return (
    <p className="text-xs text-muted-foreground">
      {new Date(rate.startDate).toLocaleDateString('id-ID')} -{' '}
      {new Date(rate.endDate).toLocaleDateString('id-ID')}
    </p>
  );
}

function RateAdjustment({ rate }: { rate: PeakRate }) {
  return (
    <p className="text-xs font-medium text-primary mt-1">
      {rate.adjustmentType === 'NOMINAL'
        ? `+ Rp ${Number(rate.adjustmentValue).toLocaleString('id-ID')}`
        : `+ ${rate.adjustmentValue}%`}
    </p>
  );
}

function RateInfo({ rate }: { rate: PeakRate }) {
  return (
    <>
      <p className="font-semibold text-sm">{rate.name}</p>
      <RateDate rate={rate} />
      <RateAdjustment rate={rate} />
    </>
  );
}

function DeleteBtn({ id, onDelete }: { id: string; onDelete: (id: string) => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={() => onDelete(id)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function PeakRateItem({ rate, onDelete }: { rate: PeakRate; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
      <div><RateInfo rate={rate} /></div>
      <DeleteBtn id={rate.id} onDelete={onDelete} />
    </div>
  );
}

function LoadingMsg() {
  return <p className="text-sm text-muted-foreground text-center py-4">Memuat...</p>;
}

function EmptyMsg() {
  return (
    <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
      Belum ada harga musiman
    </p>
  );
}

function RatesList({ rates, onDelete }: { rates: PeakRate[]; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {rates.map((rate) => (
        <PeakRateItem key={rate.id} rate={rate} onDelete={onDelete} />
      ))}
    </div>
  );
}

export function PeakSeasonList({ rates, fetching, onDelete }: PeakSeasonListProps) {
  if (fetching) return <LoadingMsg />;
  if (rates.length === 0) return <EmptyMsg />;
  return <RatesList rates={rates} onDelete={onDelete} />;
}
