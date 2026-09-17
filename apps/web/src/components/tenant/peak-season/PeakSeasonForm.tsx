import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { PeakRate } from './types';

type PeakSeasonFormProps = {
  rates: PeakRate[];
  loading: boolean;
  onSubmit: (data: Omit<PeakRate, 'id'>) => Promise<boolean>;
};

type PeakFormData = {
  name: string; startDate: string; endDate: string;
  adjustmentType: string; adjustmentValue: string;
};

const PeakFormEmpty: PeakFormData = {
  name: '', startDate: '', endDate: '',
  adjustmentType: 'NOMINAL', adjustmentValue: '',
};

function findOverlap(dates: PeakFormData, rates: PeakRate[]) {
  const { startDate, endDate } = dates;
  return rates.find((rate) => {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    return newStart <= new Date(rate.endDate) && newEnd >= new Date(rate.startDate);
  });
}

function warnOverlap(rateName: string) {
  toast.warning(`Tanggal ini tumpang tindih dengan '${rateName}'. Harga yang baru ditambahkan akan digunakan.`);
}

function buildData(formData: PeakFormData): Omit<PeakRate, 'id'> {
  return {
    name: formData.name, startDate: formData.startDate,
    endDate: formData.endDate, adjustmentType: formData.adjustmentType as 'NOMINAL' | 'PERCENTAGE',
    adjustmentValue: parseFloat(formData.adjustmentValue),
  };
}

function NameField({ formData, setFormData }: { formData: PeakFormData; setFormData: React.Dispatch<React.SetStateAction<PeakFormData>> }) {
  return (
    <div className="space-y-2">
      <Label>Nama Event / Musim</Label>
      <Input required placeholder="Contoh: Libur Lebaran" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
    </div>
  );
}

function DateFields({ formData, setFormData, today }: { formData: PeakFormData; setFormData: React.Dispatch<React.SetStateAction<PeakFormData>>; today: string }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Tanggal Mulai</Label>
        <Input type="date" required min={today} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Tanggal Akhir</Label>
        <Input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate || today} />
      </div>
    </div>
  );
}

function AdjTypeSelect({ formData, setFormData }: { formData: PeakFormData; setFormData: React.Dispatch<React.SetStateAction<PeakFormData>> }) {
  return (
    <div className="space-y-2">
      <Label>Tipe Penyesuaian</Label>
      <Select value={formData.adjustmentType} onValueChange={(v) => setFormData({ ...formData, adjustmentType: v as 'NOMINAL' | 'PERCENTAGE' })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="NOMINAL">Nominal (+ Rp)</SelectItem>
          <SelectItem value="PERCENTAGE">Persentase (+ %)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function AdjValueInput({ formData, setFormData }: { formData: PeakFormData; setFormData: React.Dispatch<React.SetStateAction<PeakFormData>> }) {
  return (
    <div className="space-y-2">
      <Label>Nilai</Label>
      <Input type="number" required min="1" value={formData.adjustmentValue} onChange={(e) => setFormData({ ...formData, adjustmentValue: e.target.value })} />
    </div>
  );
}

function AdjFields({ formData, setFormData }: { formData: PeakFormData; setFormData: React.Dispatch<React.SetStateAction<PeakFormData>> }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <AdjTypeSelect formData={formData} setFormData={setFormData} />
      <AdjValueInput formData={formData} setFormData={setFormData} />
    </div>
  );
}

function SubmitBtn({ loading }: { loading: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Tambah'}</Button>
    </div>
  );
}

export function PeakSeasonForm({ rates, loading, onSubmit }: PeakSeasonFormProps) {
  const [formData, setFormData] = useState<PeakFormData>(PeakFormEmpty);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (new Date(formData.startDate) > new Date(formData.endDate)) return toast.error('Tanggal mulai harus lebih awal');
    const overlap = findOverlap(formData, rates); if (overlap) warnOverlap(overlap.name);
    if (await onSubmit(buildData(formData))) setFormData(PeakFormEmpty);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <h4 className="font-semibold mb-2 text-sm">Tambah Harga Baru</h4><NameField formData={formData} setFormData={setFormData} />
      <DateFields formData={formData} setFormData={setFormData} today={new Date().toISOString().split('T')[0]} />
      <AdjFields formData={formData} setFormData={setFormData} /><SubmitBtn loading={loading} />
    </form>
  );
}
