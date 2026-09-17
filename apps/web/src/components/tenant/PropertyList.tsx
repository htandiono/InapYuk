'use client';

import { Property, useProperties, delProp } from './PropertyListHooks';
import { CreateDialog, EditDialog, PropertyListHeader, PropertyListTable, DeleteConfirmation } from './PropertyListComponents';
import { PaginationControls } from './PaginationControls';
import { useState } from 'react';
import { toast } from 'sonner';

function usePropertyDeleter(page: number, fetchProps: (p: number) => Promise<void>) {
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
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : String(err)); } finally { setIsDeleting(false); }
  };
  return { deletingId, setDeletingId, isDeleting, confirmDelete };
}

function PageState() {
  const [page, setPage] = useState(1);
  return { page, setPage };
}

function DialogStates() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  return { isCreateOpen, setIsCreateOpen, editingProperty, setEditingProperty };
}

function renderContent(state: { page: number; setPage: (val: number | ((p: number) => number)) => void }, dialogs: ReturnType<typeof DialogStates>, props: { properties: Property[]; totalPages: number; loading: boolean; fetchProps: (p: number) => Promise<void>; deletingId: string | null; isDeleting: boolean; setDeletingId: (id: string | null) => void; confirmDelete: () => Promise<void> }) {
  return (
    <div>
      <PropertyListHeader setIsCreateOpen={dialogs.setIsCreateOpen} />
      <CreateDialog open={dialogs.isCreateOpen} setOpen={dialogs.setIsCreateOpen} onDone={() => { dialogs.setIsCreateOpen(false); void props.fetchProps(state.page); }} />
      <PropertyListTable loading={props.loading} properties={props.properties} setEditingProperty={dialogs.setEditingProperty} setDeletingId={props.setDeletingId} />
      <PaginationControls page={state.page} totalPages={props.totalPages} setPage={state.setPage} loading={props.loading} />
      <EditDialog p={dialogs.editingProperty} setP={dialogs.setEditingProperty} onDone={() => { dialogs.setEditingProperty(null); void props.fetchProps(state.page); }} />
      <DeleteConfirmation deletingId={props.deletingId} isDeleting={props.isDeleting} setDeletingId={props.setDeletingId} confirmDelete={props.confirmDelete} />
    </div>
  );
}

export default function PropertyList() {
  const { page, setPage } = PageState();
  const dialogs = DialogStates();
  const { properties, totalPages, loading, fetchProps } = useProperties(page);
  const { deletingId, setDeletingId, isDeleting, confirmDelete } = usePropertyDeleter(page, fetchProps);
  return renderContent({ page, setPage }, dialogs, { properties, totalPages, loading, fetchProps, deletingId, isDeleting, setDeletingId, confirmDelete });
}
