import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';
import { AvailabilityData } from './useAvailability';

type AvailabilityFormProps = {
  loading: boolean;
  totalUnits?: number;
  onSubmit: (data: AvailabilityData) => void;
  onCancel: () => void;
};

export function AvailabilityForm({ loading, totalUnits, onSubmit, onCancel }: AvailabilityFormProps) {
  const [formData, setFormData] = useState<AvailabilityData>({
    startDate: '',
    endDate: '',
    isAvailable: true,
    availableUnits: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Tanggal mulai tidak boleh lebih dari selesai');
      return;
    }
    onSubmit(formData);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tanggal Mulai</Label>
          <Input
            type="date"
            required
            min={today}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Tanggal Akhir</Label>
          <Input
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            min={formData.startDate || today}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <Label className="text-base">Kamar Tersedia</Label>
          <p className="text-sm text-muted-foreground">Aktifkan untuk menerima pesanan pada tanggal ini</p>
        </div>
        <Switch
          checked={formData.isAvailable}
          onCheckedChange={(c: boolean) => {
            setFormData({ ...formData, isAvailable: c, availableUnits: c ? formData.availableUnits : '' });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Override Total Unit (Opsional)</Label>
        <Input
          type="number"
          min="1"
          max={totalUnits}
          placeholder={`Biarkan kosong untuk default kamar`}
          value={formData.availableUnits}
          onChange={(e) => setFormData({ ...formData, availableUnits: e.target.value })}
          disabled={!formData.isAvailable}
        />
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
          Tentukan batas maksimal unit yang bisa dipesan (sudah termasuk yang terpesan). Maksimal: <strong>{totalUnits} unit</strong>.
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
