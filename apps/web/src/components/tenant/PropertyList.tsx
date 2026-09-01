'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Property } from './PropertyCard';
import PropertyForm from './PropertyForm';
import { PropertyListTable } from './PropertyListTable';
import { PaginationControls } from './PaginationControls';
import { PropertyDeleteDialog } from './PropertyDeleteDialog';
import { usePropertyFetcher } from './usePropertyFetcher';
import { useFullProperty } from './useFullProperty';

function PropertyCreateButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="gap-2 shadow-sm rounded-full px-6">
      <Plus className="h-4 w-4" /> Tambah Properti
    </Button>
  );
}

export default function PropertyList() {
  const [page, setPage] = useState(1);
  const { properties, totalPages, loading, fetchProps } = usePropertyFetcher(page);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex justify-end mb-6">
        <PropertyCreateButton onClick={() => setIsCreateOpen(true)} />
      </div>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Properti Baru</DialogTitle>
          </DialogHeader>
          <PropertyForm
            onSuccess={() => {
              setIsCreateOpen(false);
              void fetchProps(page);
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
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
        fetchProps={fetchProps}
        page={page}
      />
      <PropertyDeleteDialog
        deletingId={deletingId}
        isDeleting={false}
        onConfirm={async () => {
          setDeletingId(null);
          await fetchProps(page);
        }}
        onOpenChange={(open) => !open && setDeletingId(null)}
      />
    </div>
  );
}

function EditDialog({
  p,
  setP,
  fetchProps,
  page,
}: {
  p: Property | null;
  setP: (p: Property | null) => void;
  fetchProps: (p: number) => void;
  page: number;
}) {
  const { fullProp, loadingFull } = useFullProperty(p);

  if (!p) return null;

  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && setP(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Properti</DialogTitle>
        </DialogHeader>
        {loadingFull ? (
          <LoadingSpinner />
        ) : fullProp ? (
          <PropertyForm
            initialData={fullProp}
            onSuccess={() => {
              setP(null);
              void fetchProps(page);
            }}
            onCancel={() => setP(null)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
