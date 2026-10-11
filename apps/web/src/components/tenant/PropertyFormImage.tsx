'use client';

import { PropertyFormImageGrid } from './PropertyFormImageGrid';
import type { usePropertyFormImages } from './usePropertyFormImages';

export function PropertyFormImages({
  hook,
  loading,
}: {
  hook: ReturnType<typeof usePropertyFormImages>;
  loading: boolean;
}) {
  return (
    <PropertyFormImageGrid
      existingImages={hook.existingImages}
      files={hook.files}
      mainImageId={hook.mainImageId}
      mainImageIndex={hook.mainImageIndex}
      totalSlots={hook.totalSlots}
      loading={loading}
      handleFileChange={hook.handleFileChange}
      removeNewFile={hook.removeNewFile}
      onSetMainImageExisting={(id) => {
        hook.setMainImageId(id);
        hook.setMainImageIndex(null);
      }}
      onSetMainImageNew={(i) => {
        hook.setMainImageIndex(i);
        hook.setMainImageId(null);
      }}
      onDeleteExisting={(id) => {
        hook.setDeletedImages([...hook.deletedImages, id]);
        if (hook.mainImageId === id) hook.setMainImageId(null);
      }}
    />
  );
}
