import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type PeakSeasonDialogProps = {
  roomId: string | null;
  onClose: () => void;
};

export interface PeakRate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE';
  adjustmentValue: string | number;
}

export function PeakSeasonDialog({ roomId, onClose }: PeakSeasonDialogProps) {
  const [rates, setRates] = useState<PeakRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    adjustmentType: 'NOMINAL',
    adjustmentValue: '',
  });

  const fetchRates = useCallback(async () => {
    if (!roomId) return;
    setFetching(true);
    try {
      const res = await api.get<PeakRate[]>(`/rooms/tenant/rooms/${roomId}/peak-season`);
      setRates(res);
    } catch {
      toast.error('Gagal memuat harga musiman');
    } finally {
      setFetching(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      void fetchRates();
    }
  }, [roomId, fetchRates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Tanggal mulai harus lebih awal dari tanggal selesai');
      return;
    }

    const overlappedRate = rates.find((rate) => {
      const rateStart = new Date(rate.startDate);
      const rateEnd = new Date(rate.endDate);
      const newStart = new Date(formData.startDate);
      const newEnd = new Date(formData.endDate);
      return newStart <= rateEnd && newEnd >= rateStart;
    });

    if (overlappedRate) {
      toast.warning(
        `Tanggal ini tumpang tindih dengan '${overlappedRate.name}'. Harga yang baru ditambahkan akan digunakan.`,
      );
    }

    setLoading(true);
    try {
      await api.post(`/rooms/tenant/rooms/${roomId}/peak-season`, {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        adjustmentType: formData.adjustmentType,
        adjustmentValue: parseFloat(formData.adjustmentValue),
      });

      toast.success('Harga musiman berhasil ditambahkan');
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        adjustmentType: 'NOMINAL',
        adjustmentValue: '',
      });
      await fetchRates();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rateId: string) => {
    try {
      await api.delete(`/rooms/tenant/peak-season/${rateId}`);
      toast.success('Berhasil dihapus');
      await fetchRates();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  return (
    <Dialog open={!!roomId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Harga Musiman</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/20">
          <h4 className="font-semibold mb-2 text-sm">Tambah Harga Baru</h4>
          <div className="space-y-2">
            <Label>Nama Event / Musim</Label>
            <Input
              required
              placeholder="Contoh: Libur Lebaran"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                required
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
                min={formData.startDate}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipe Penyesuaian</Label>
              <Select
                value={formData.adjustmentType}
                onValueChange={(v) => setFormData({ ...formData, adjustmentType: v as 'NOMINAL' | 'PERCENTAGE' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOMINAL">Nominal (+ Rp)</SelectItem>
                  <SelectItem value="PERCENTAGE">Persentase (+ %)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nilai</Label>
              <Input
                type="number"
                required
                min="1"
                value={formData.adjustmentValue}
                onChange={(e) => setFormData({ ...formData, adjustmentValue: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Tambah'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <h4 className="font-semibold mb-3">Daftar Harga Musiman</h4>
          {fetching ? (
            <p className="text-sm text-muted-foreground text-center py-4">Memuat...</p>
          ) : rates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
              Belum ada harga musiman
            </p>
          ) : (
            <div className="space-y-3">
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card"
                >
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
                    onClick={() => handleDelete(rate.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
