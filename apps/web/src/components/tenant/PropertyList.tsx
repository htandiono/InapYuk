'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PropertyTableRow, type Property } from './PropertyCard';
import PropertyForm from './PropertyForm';

type PaginationProps = {
  page: number;
  totalPages: number;
  setPage: (val: number | ((p: number) => number)) => void;
  loading: boolean;
};

type CreateDialogProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onDone: () => void;
};

type EditDialogProps = {
  p: Property | null;
  setP: (p: Property | null) => void;
  onDone: () => void;
};

function useFullProperty(p: Property | null) {
  const [fullProp, setFullProp] = useState<Property | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  useEffect(() => {
    if (!p) {
      Promise.resolve().then(() => setFullProp(null));
      return;
    }
    const controller = new AbortController();
    (async () => {
      setLoadingFull(true);
      try {
        const r = await fetch(`/api/properties/tenant/properties/${p.id}?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' }, signal: controller.signal });
        const json = await r.json();
        setFullProp(json.data || p);
      } catch {
        if (!controller.signal.aborted) setFullProp(p);
      } finally {
        if (!controller.signal.aborted) setLoadingFull(false);
      }
    })();
    return () => controller.abort();
  }, [p]);
  return { fullProp, loadingFull };
}

type GridProps = {
  loading: boolean;
  properties: Property[];
  setEditingProperty: (p: Property) => void;
  setDeletingId: (id: string) => void;
};

function PrevBtn({ page, loading, setPage }: PaginationProps) {
  return (
    <Button
      variant="outline"
      disabled={page === 1 || loading}
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      className="h-8 rounded-lg"
      size="sm"
    >
      Sebelumnya
    </Button>
  );
}

function NextBtn({ page, loading, totalPages, setPage }: PaginationProps) {
  return (
    <Button
      variant="outline"
      disabled={page === totalPages || loading}
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      className="h-8 rounded-lg"
      size="sm"
    >
      Selanjutnya
    </Button>
  );
}

function PaginationControls({ page, totalPages, setPage, loading }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-2 mt-6">
      <div className="text-sm text-muted-foreground hidden sm:block">
        Menampilkan halaman <span className="font-medium text-foreground">{page}</span> dari{' '}
        <span className="font-medium text-foreground">{totalPages}</span>
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
        <PrevBtn page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
        
        <div className="hidden sm:flex items-center gap-1 mx-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={page === p ? 'default' : 'ghost'}
              size="sm"
              className={`w-8 h-8 p-0 rounded-lg ${page !== p ? 'text-muted-foreground hover:text-foreground' : ''}`}
              onClick={() => setPage(p)}
              disabled={loading}
            >
              {p}
            </Button>
          ))}
        </div>

        <NextBtn page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
      </div>
    </div>
  );
}

function CreateDialog({ open, setOpen, onDone }: CreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Properti Baru</DialogTitle>
        </DialogHeader>
        <PropertyForm onSuccess={onDone} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ p, setP, onDone }: EditDialogProps) {
  const { fullProp, loadingFull } = useFullProperty(p);
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && setP(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Properti</DialogTitle>
        </DialogHeader>
        {loadingFull && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        {!loadingFull && fullProp && (
          <PropertyForm initialData={fullProp} onSuccess={onDone} onCancel={() => setP(null)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

async function loadProps(p: number) {
  const res = await fetch(`/api/properties/tenant/properties?page=${p}&limit=10&t=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
}

function useProperties(page: number) {
  const [state, setState] = useState({
    properties: [] as Property[],
    totalPages: 1,
    loading: true,
  });
  const fetchProps = useCallback(async (p: number) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const json = await loadProps(p);
      setState({
        properties: json.data.items || json.data,
        totalPages: json.data.meta?.totalPages || 1,
        loading: false,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal');
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(() => fetchProps(page));
  }, [page, fetchProps]);
  return { ...state, fetchProps };
}

async function delProp(id: string) {
  const res = await fetch(`/api/properties/tenant/properties/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json()).message);
}

function PropertyListHeader({ setIsCreateOpen }: { setIsCreateOpen: (v: boolean) => void }) {
  return (
    <div className="flex justify-end mb-6">
      <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm rounded-full px-6">
        <Plus className="h-4 w-4" />
        Tambah Properti
      </Button>
    </div>
  );
}

function PropertyListTable({ loading, properties, setEditingProperty, setDeletingId }: GridProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/40">
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground">
              Properti
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden sm:table-cell w-45">
              Kategori
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hidden lg:table-cell w-55">
              Detail Kamar
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground w-[320px]">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent border-b border-border/40">
                <TableCell className="h-24">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-24 rounded-md shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="h-24 hidden sm:table-cell">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="h-24 hidden lg:table-cell">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>
                <TableCell className="h-24 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-28 rounded-lg" />
                    <Skeleton className="h-9 w-20 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : properties.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="h-100 text-center">
                <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Building2 className="h-10 w-10 text-primary opacity-60" />
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">Belum ada properti</h3>
                  <p className="text-center max-w-sm mb-8 text-sm text-muted-foreground">
                    Anda belum memiliki properti. Tambahkan properti pertama Anda untuk mulai menyewakan.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            properties.map((p) => (
              <PropertyTableRow 
                key={p.id} 
                p={p} 
                onEdit={setEditingProperty} 
                onDelete={setDeletingId} 
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function PropertyList() {
  const [page, setPage] = useState(1);
  const { properties, totalPages, loading, fetchProps } = useProperties(page);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await delProp(deletingId);
      toast.success('Properti berhasil dihapus');
      setDeletingId(null);
      fetchProps(page);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PropertyListHeader setIsCreateOpen={setIsCreateOpen} />
      
      <CreateDialog
        open={isCreateOpen}
        setOpen={setIsCreateOpen}
        onDone={() => {
          setIsCreateOpen(false);
          fetchProps(page);
        }}
      />
      
      <PropertyListTable
        loading={loading}
        properties={properties}
        setEditingProperty={setEditingProperty}
        setDeletingId={setDeletingId}
      />
      
      <PaginationControls page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
      
      <EditDialog
        p={editingProperty}
        setP={setEditingProperty}
        onDone={() => {
          setEditingProperty(null);
          fetchProps(page);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && !isDeleting && setDeletingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus properti ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
