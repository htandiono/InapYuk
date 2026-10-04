import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { PeakRate } from './types';

type PeakSeasonFormProps = { rates: PeakRate[]; loading: boolean; onSubmit: (data: Omit<PeakRate, 'id'>) => Promise<boolean>; };
type FormData = { name: string; startDate: string; endDate: string; adjustmentType: string; adjustmentValue: string };

export function PeakSeasonForm({ rates, loading, onSubmit }: PeakSeasonFormProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', startDate: '', endDate: '', adjustmentType: 'NOMINAL', adjustmentValue: '' });
  const handleSubmit = usePeakSeasonSubmit(rates, onSubmit, formData, setFormData);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <h4 className="font-semibold mb-2 text-sm">Tambah Harga Baru</h4>
      <NameField formData={formData} setFormData={setFormData} />
      <div className="grid grid-cols-2 gap-4"><DateFields formData={formData} setFormData={setFormData} /></div>
      <div className="grid grid-cols-2 gap-4"><AdjustmentFields formData={formData} setFormData={setFormData} /></div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Tambah'}</Button>
      </div>
    </form>
  );
}

function NameField({ formData, setFormData }: { formData: FormData; setFormData: Dispatch<SetStateAction<FormData>> }) {
  return (
    <div className="space-y-2">
      <Label>Nama Event / Musim</Label>
      <Input required placeholder="Contoh: Libur Lebaran" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
    </div>
  );
}

function DateFields({ formData, setFormData }: { formData: FormData; setFormData: Dispatch<SetStateAction<FormData>> }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Tanggal Mulai</Label>
        <Input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Tanggal Akhir</Label>
        <Input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate} />
      </div>
    </>
  );
}

function AdjustmentFields({ formData, setFormData }: { formData: FormData; setFormData: Dispatch<SetStateAction<FormData>> }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Tipe Penyesuaian</Label>
        <Select value={formData.adjustmentType} onValueChange={(v) => setFormData({ ...formData, adjustmentType: v as 'NOMINAL' | 'PERCENTAGE' })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="NOMINAL">Nominal (+ Rp)</SelectItem><SelectItem value="PERCENTAGE">Persentase (+ %)</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Nilai</Label>
        <Input type="number" required min="1" value={formData.adjustmentValue} onChange={(e) => setFormData({ ...formData, adjustmentValue: e.target.value })} />
      </div>
    </>
  );
}

function usePeakSeasonSubmit(rates: PeakRate[], onSubmit: (data: Omit<PeakRate, 'id'>) => Promise<boolean>, formData: FormData, setFormData: Dispatch<SetStateAction<FormData>>) {
  return async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Tanggal mulai harus lebih awal dari tanggal selesai');
      return;
    }
    checkOverlap(rates, formData);
    const success = await onSubmit({ name: formData.name, startDate: formData.startDate, endDate: formData.endDate, adjustmentType: formData.adjustmentType as 'NOMINAL' | 'PERCENTAGE', adjustmentValue: parseFloat(formData.adjustmentValue) });
    if (success) setFormData({ name: '', startDate: '', endDate: '', adjustmentType: 'NOMINAL', adjustmentValue: '' });
  };
}

function checkOverlap(rates: PeakRate[], formData: FormData) {
  const overlapped = rates.find((rate) => {
    return new Date(formData.startDate) <= new Date(rate.endDate) && new Date(formData.endDate) >= new Date(rate.startDate);
  });
  if (overlapped) toast.warning(`Tanggal ini tumpang tindih dengan '${overlapped.name}'. Harga yang baru ditambahkan akan digunakan.`);
}
