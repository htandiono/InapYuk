'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';
import { PropertyTableRow, type Property } from './PropertyCard';
import PropertyForm from './PropertyFormNew';

export function CreateDialog({ open, setOpen, onDone }: { open: boolean; setOpen: (v: boolean) => void; onDone: () => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Properti Baru</DialogTitle></DialogHeader>
        <PropertyForm onSuccess={onDone} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function useFullProperty(p: Property | null) {
  const [fullProp, setFullProp] = useState<Property | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  useEffect(() => {
    if (!p) return setFullProp(null);
    const c = new AbortController();
    (async () => {
      await Promise.resolve(); setLoadingFull(true);
      try {
        const r = await fetch(`/api/properties/tenant/properties/${p.id}?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' }, signal: c.signal });
        setFullProp((await r.json()).data || p);
      } catch { if (!c.signal.aborted) setFullProp(p); } finally { if (!c.signal.aborted) setLoadingFull(false); }
    })();
    return () => c.abort();
  }, [p]);
  return { fullProp, loadingFull };
}

export function EditDialog({ p, setP, onDone }: { p: Property | null; setP: (p: Property | null) => void; onDone: () => void }) {
  const { fullProp, loadingFull } = useFullProperty(p);
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && setP(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Properti</DialogTitle></DialogHeader>
        {loadingFull && <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}
        {!loadingFull && fullProp && <PropertyForm initialData={fullProp} onSuccess={onDone} onCancel={() => setP(null)} />}
      </DialogContent>
    </Dialog>
  );
}

export function PropertyListHeader({ setIsCreateOpen }: { setIsCreateOpen: (v: boolean) => void }) {
  return (
    <div className="flex justify-end mb-6">
      <Button onClick={() => setIsCreateOpen(true)} className="shadow-sm rounded-full px-6">
        Tambah Properti
      </Button>
    </div>
  );
}

function TableLoadingRow() {
  return (
    <tr className="hover:bg-transparent border-b border-border/40">
      <td className="h-24"><div className="flex items-center gap-4"><Skeleton className="h-16 w-24 rounded-md shrink-0" /><div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-24" /></div></div></td>
      <td className="h-24 hidden sm:table-cell"><Skeleton className="h-6 w-24 rounded-full" /></td>
      <td className="h-24 hidden lg:table-cell"><div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-32" /></div></td>
      <td className="h-24 text-right"><div className="flex justify-end gap-2"><Skeleton className="h-9 w-28 rounded-lg" /><Skeleton className="h-9 w-20 rounded-lg" /><Skeleton className="h-9 w-24 rounded-lg" /></div></td>
    </tr>
  );
}

function TableEmptyRow() {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={4} className="h-100 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6"><Building2 className="h-10 w-10 text-primary opacity-60" /></div>
          <h3 className="text-xl font-medium text-foreground mb-2">Belum ada properti</h3>
          <p className="text-center max-w-sm mb-8 text-sm text-muted-foreground">Anda belum memiliki properti. Tambahkan properti pertama Anda untuk mulai menyewakan.</p>
        </div>
      </td>
    </tr>
  );
}

export function PropertyListTable({ loading, properties, setEditingProperty, setDeletingId }: { loading: boolean; properties: Property[]; setEditingProperty: (p: Property | null) => void; setDeletingId: (id: string) => void; }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm overflow-hidden">
      <table className="w-full">
        <thead><tr className="hover:bg-transparent border-b border-border/40">
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground">Properti</th><th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden sm:table-cell w-45">Kategori</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden lg:table-cell w-55">Detail Kamar</th><th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground w-[320px]">Aksi</th>
        </tr></thead>
        <tbody>
          {loading ? Array.from({ length: 3 }).map((_, i) => <TableLoadingRow key={i} />) : properties.length === 0 ? <TableEmptyRow /> : properties.map((p) => <PropertyTableRow key={p.id} p={p} onEdit={setEditingProperty} onDelete={setDeletingId} />)}
        </tbody>
      </table>
    </div>
  );
}

export function DeleteConfirmation({ deletingId, isDeleting, setDeletingId, confirmDelete }: { deletingId: string | null; isDeleting: boolean; setDeletingId: (id: string | null) => void; confirmDelete: () => Promise<void>; }) {
  return (
    <Dialog open={!!deletingId} onOpenChange={(open) => !open && !isDeleting && setDeletingId(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Konfirmasi Hapus</DialogTitle></DialogHeader>
        <div className="py-4"><p className="text-muted-foreground">Apakah Anda yakin ingin menghapus properti ini? Tindakan ini tidak dapat dibatalkan.</p></div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting}>Batal</Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
