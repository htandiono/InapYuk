'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MIN_SIZE = 50 * 1024;
const MAX_SIZE = 5 * 1024 * 1024;

export function usePropertyFormImages(initialData?: { images?: { id: string; url: string }[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    e.target.value = '';
    const sizeValid = filterAllowedFiles(newFiles);
    if (sizeValid.length === 0) return;
    toast.info('Memverifikasi gambar...');
    setFiles((prev) => [...prev, ...sizeValid]);
  }, []);

  const removeNewFile = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      if (mainImageIndex === index) setMainImageIndex(null);
      else if (mainImageIndex !== null && mainImageIndex > index)
        setMainImageIndex(mainImageIndex - 1);
    },
    [mainImageIndex],
  );

  const existingImages = (initialData?.images || []).filter(
    (img) => !deletedImages.includes(img.id),
  );
  const totalSlots = existingImages.length + files.length;

  return {
    files,
    setFiles,
    deletedImages,
    setDeletedImages,
    mainImageId,
    setMainImageId,
    mainImageIndex,
    setMainImageIndex,
    existingImages,
    totalSlots,
    handleFileChange,
    removeNewFile,
  };
}

function filterAllowedFiles(files: File[]): File[] {
  return files.filter((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: Format tidak didukung. Gunakan .jpg atau .png.`);
      return false;
    }
    if (file.size < MIN_SIZE) {
      toast.error(`${file.name}: Ukuran file terlalu kecil (min. 50KB).`, { duration: 5000 });
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name}: Ukuran file terlalu besar (maks. 5MB).`);
      return false;
    }
    return true;
  });
}
