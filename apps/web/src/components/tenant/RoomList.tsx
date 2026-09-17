'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Home as HomeIcon, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Room, RoomCard } from './RoomCard';
import RoomForm from './RoomForm';
import { AvailabilityDialog } from './availability/AvailabilityDialog';
import { PeakSeasonDialog } from './peak-season/PeakSeasonDialog';

type PaginationProps = { page: number; totalPages: number; setPage: (fn: (p: number) => number) => void; loading: boolean; };
type CreateProps = { open: boolean; setOpen: (v: boolean) => void; propertyId: string; onDone: () => void; };
type EditProps = { r: Room | null; setR: (r: Room | null) => void; propertyId: string; onDone: () => void; };
type GridProps = { loading: boolean; rooms: Room[]; setEditing: (r: Room) => void; handleDelete: (id: string) => void; onManageAvailability: (id: string) => void; onManagePeakSeason: (id: string) => void; };

async function loadRooms(pid: string, p: number) {
  const res = await fetch(`/api/rooms/tenant/properties/${pid}/rooms?page=${p}&limit=10`);
  if (!res.ok) throw new Error((await res.json()).message || 'Gagal memuat kamar');
  return res.json();
}
async function delRoom(id: string) {
  const res = await fetch(`/api/rooms/tenant/rooms/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json()).message || 'Gagal menghapus kamar');
}

function useRooms(propertyId: string, page: number) {
  const [state, setState] = useState({ rooms: [] as Room[], totalPages: 1, loading: true });
  const fetchRooms = useCallback(async (p: number) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const json = await loadRooms(propertyId, p);
      setState({ rooms: json.data.items || json.data, totalPages: json.data.meta?.totalPages || 1, loading: false });
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Gagal'); setState(s => ({ ...s, loading: false })); } 
  }, [propertyId]);
  useEffect(() => { void Promise.resolve().then(() => fetchRooms(page)); }, [page, fetchRooms]);
  return { ...state, fetchRooms };
}

function useRoomActions(fetchRooms: (p: number) => void, page: number) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await delRoom(deletingId); toast.success('Kamar berhasil dihapus'); fetchRooms(page);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : String(err)); } 
    finally { setIsDeleting(false); setDeletingId(null); }
  };
  return { deletingId, setDeletingId, isDeleting, confirmDelete };
}

function RoomListHeader({ setOpen }: { setOpen: (v: boolean) => void }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold tracking-tight">Daftar Kamar</h2>
      <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Tambah Kamar</Button>
    </div>
  );
}

function EmptyRooms() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed bg-white">
      <HomeIcon className="h-10 w-10 text-muted-foreground mb-3 opacity-50" /><h3 className="text-lg font-medium">Belum ada kamar</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">Tambahkan jenis kamar untuk properti ini agar dapat mulai disewakan.</p>
    </div>
  );
}

function RoomListGrid({ loading, rooms, setEditing, handleDelete, onManageAvailability, onManagePeakSeason }: GridProps) {
  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} className="h-52.5 rounded-xl bg-muted/50 animate-pulse" />)}</div>;
  if (rooms.length === 0) return <EmptyRooms />;
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{rooms.map((r) => <RoomCard key={r.id} r={r} onEdit={setEditing} onDelete={handleDelete} onManageAvailability={onManageAvailability} onManagePeakSeason={onManagePeakSeason} />)}</div>;
}

function PrevBtn({ page, loading, setPage }: PaginationProps) {
  return <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Sebelumnya</Button>;
}

function NextBtn({ page, loading, totalPages, setPage }: PaginationProps) {
  return <Button variant="outline" disabled={page === totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Selanjutnya</Button>;
}

function PaginationControls({ page, totalPages, setPage, loading }: { page: number, totalPages: number, setPage: (fn: (p: number) => number) => void, loading: boolean }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-between items-center mt-6">
      <PrevBtn page={page} totalPages={totalPages} setPage={setPage} loading={loading} /><span className="text-sm">Halaman {page} dari {totalPages}</span><NextBtn page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
    </div>
  );
}

function CreateRoomDialog({ open, setOpen, propertyId, onDone }: CreateProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Kamar Baru</DialogTitle></DialogHeader>
        <RoomForm propertyId={propertyId} onSuccess={onDone} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EditRoomDialog({ r, setR, propertyId, onDone }: EditProps) {
  return (
    <Dialog open={!!r} onOpenChange={(o) => !o && setR(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Kamar</DialogTitle></DialogHeader>
        {r && <RoomForm propertyId={propertyId} initialData={r} onSuccess={onDone} onCancel={() => setR(null)} />}
      </DialogContent>
    </Dialog>
  );
}

function DeleteRoomDialog({ deletingId, setDeletingId, isDeleting, confirmDelete }: { deletingId: string | null, setDeletingId: (id: string | null) => void, isDeleting: boolean, confirmDelete: () => void }) {
  return (
    <Dialog open={!!deletingId} onOpenChange={(open) => !open && !isDeleting && setDeletingId(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Konfirmasi Hapus</DialogTitle></DialogHeader>
        <div className="py-4"><p className="text-muted-foreground">Apakah Anda yakin ingin menghapus kamar ini? Tindakan ini tidak dapat dibatalkan.</p></div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting}>Batal</Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useRoomListState() {
  const [[page, isCreate, edit], set] = useState<[number, boolean, Room|null]>([1, false, null]);
  const [availabilityRoomId, setAvailabilityRoomId] = useState<string | null>(null);
  const [peakSeasonRoomId, setPeakSeasonRoomId] = useState<string | null>(null);
  return { page, isCreate, edit, set, availabilityRoomId, setAvailabilityRoomId, peakSeasonRoomId, setPeakSeasonRoomId };
}

export default function RoomList({ propertyId }: { propertyId: string }) {
  const st = useRoomListState(), { rooms, totalPages, loading, fetchRooms } = useRooms(propertyId, st.page), acts = useRoomActions(fetchRooms, st.page);
  return (
    <div className="space-y-6">
      <RoomListHeader setOpen={(c) => st.set([st.page, c, st.edit])} />
      <CreateRoomDialog open={st.isCreate} setOpen={(c) => st.set([st.page, c, st.edit])} propertyId={propertyId} onDone={() => { st.set([st.page, false, st.edit]); fetchRooms(st.page); }} />
      <RoomListGrid loading={loading} rooms={rooms} setEditing={(e) => st.set([st.page, st.isCreate, e])} handleDelete={acts.setDeletingId} onManageAvailability={st.setAvailabilityRoomId} onManagePeakSeason={st.setPeakSeasonRoomId} />
      <PaginationControls page={st.page} totalPages={totalPages} setPage={(p) => st.set([typeof p === 'function' ? (p as (n: number) => number)(st.page) : p, st.isCreate, st.edit])} loading={loading} />
      <EditRoomDialog r={st.edit} setR={(e) => st.set([st.page, st.isCreate, e])} propertyId={propertyId} onDone={() => { st.set([st.page, st.isCreate, null]); fetchRooms(st.page); }} />
      <DeleteRoomDialog {...acts} />
      <AvailabilityDialog roomId={st.availabilityRoomId} totalUnits={rooms.find(r => r.id === st.availabilityRoomId)?.totalUnits} onClose={() => st.setAvailabilityRoomId(null)} />
      <PeakSeasonDialog roomId={st.peakSeasonRoomId} onClose={() => st.setPeakSeasonRoomId(null)} />
    </div>
  );
}
