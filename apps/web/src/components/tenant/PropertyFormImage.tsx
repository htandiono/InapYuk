'use client';

import { PropertyFormImageGrid } from './PropertyFormImageGrid';
import type { usePropertyFormImages } from './usePropertyFormImages';

type ImagesHook = ReturnType<typeof usePropertyFormImages>;

function useImageHandlers(h: ImagesHook) {
  const setMain = (id: string | null, index: number | null) => {
    h.setMainImageId(id);
    h.setMainImageIndex(index);
  };
  return {
    onSetMainImageExisting: (id: string) => setMain(id, null),
    onSetMainImageNew: (i: number) => setMain(null, i),
    onDeleteExisting: (id: string) => {
      h.setDeletedImages([...h.deletedImages, id]);
      if (h.mainImageId === id) h.setMainImageId(null);
    },
  };
}

export function PropertyFormImages({ hook, loading }: { hook: ImagesHook; loading: boolean }) {
  const handlers = useImageHandlers(hook);
  return <PropertyFormImageGrid {...hook} {...handlers} loading={loading} />;
}
