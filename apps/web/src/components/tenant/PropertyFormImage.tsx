'use client';

import { PropertyFormImageGrid } from './PropertyFormImageGrid';
import { usePropertyFormImages } from './usePropertyFormImages';

export function PropertyFormImages({
  initialData,
  loading,
}: {
  initialData?: { images?: { id: string; url: string }[] };
  loading: boolean;
}) {
  const {
    files,
    deletedImages,
    mainImageId,
    mainImageIndex,
    existingImages,
    totalSlots,
    handleFileChange,
    removeNewFile,
    setDeletedImages,
    setMainImageId,
    setMainImageIndex,
  } = usePropertyFormImages(initialData);

  return (
    <PropertyFormImageGrid
      existingImages={existingImages}
      files={files}
      mainImageId={mainImageId}
      mainImageIndex={mainImageIndex}
      totalSlots={totalSlots}
      loading={loading}
      handleFileChange={handleFileChange}
      removeNewFile={removeNewFile}
      onSetMainImageExisting={(id) => {
        setMainImageId(id);
        setMainImageIndex(null);
      }}
      onSetMainImageNew={(i) => {
        setMainImageIndex(i);
        setMainImageId(null);
      }}
      onDeleteExisting={(id) => {
        setDeletedImages([...deletedImages, id]);
        if (mainImageId === id) setMainImageId(null);
      }}
    />
  );
}
