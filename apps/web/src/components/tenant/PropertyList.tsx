'use client';

import { Property, useProperties, delProp } from './PropertyListHooks';
import {
  CreateDialog,
  EditDialog,
  PropertyListHeader,
  PropertyListTable,
  DeleteConfirmation,
} from './PropertyListComponents';
import { PaginationControls } from './PaginationControls';
import { useState } from 'react';
import { toast } from 'sonner';

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

      <DeleteConfirmation
        deletingId={deletingId}
        isDeleting={isDeleting}
        setDeletingId={setDeletingId}
        confirmDelete={confirmDelete}
      />
    </div>
  );
}
