'use client';

import { useCallback } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ImageItem = { id: string; url: string };
type NewFile = File;

export function PropertyFormImages({
  initialData,
  files,
  setFiles,
  deletedImages,
  setDeletedImages,
  mainImageId,
  setMainImageId,
  mainImageIndex,
  setMainImageIndex,
  loading,
}: {
  initialData?: { images?: ImageItem[] };
  files: NewFile[];
  setFiles: React.Dispatch<React.SetStateAction<NewFile[]>>;
  deletedImages: string[];
  setDeletedImages: React.Dispatch<React.SetStateAction<string[]>>;
  mainImageId: string | null;
  setMainImageId: React.Dispatch<React.SetStateAction<string | null>>;
  mainImageIndex: number | null;
  setMainImageIndex: React.Dispatch<React.SetStateAction<number | null>>;
  loading: boolean;
}) {
  const validateImageDimensions = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        if (width < 800 || height < 600) {
          toast.error(`${file.name}: Resolusi terlalu kecil (${width}×${height}px). Minimal 800×600px.`, { duration: 5000 });
          resolve(false);
          return;
        }
        if (width < height) {
          toast.warning(`${file.name}: Foto portrait kurang optimal. Gunakan foto landscape untuk tampilan terbaik.`, { duration: 5000 });
        }
        resolve(true);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error(`${file.name}: File gambar tidak valid.`);
        resolve(false);
      };
      img.src = url;
    });
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    e.target.value = '';
    const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
    const MIN_SIZE_BYTES = 50 * 1024;
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    const sizeAndTypeValid = newFiles.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Format tidak didukung. Gunakan .jpg atau .png.`);
        return false;
      }
      if (file.size < MIN_SIZE_BYTES) {
        toast.error(`${file.name}: Ukuran file terlalu kecil (min. 50KB).`, { duration: 5000 });
        return false;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`${file.name}: Ukuran file terlalu besar (maks. 5MB).`);
        return false;
      }
      return true;
    });
    if (sizeAndTypeValid.length === 0) return;
    const dimensionResults = await Promise.all(sizeAndTypeValid.map((f) => validateImageDimensions(f)));
    const validFiles = sizeAndTypeValid.filter((_, i) => dimensionResults[i]);
    if (validFiles.length === 0) return;
    const totalImages = (initialData?.images?.length || 0) - deletedImages.length + files.length + validFiles.length;
    if (totalImages > 10) {
      toast.error('Maksimal 10 gambar diperbolehkan');
      return;
    }
    setFiles((prev) => [...prev, ...validFiles]);
  }, [files, deletedImages, initialData?.images, validateImageDimensions, setFiles]);

  const removeNewFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (mainImageIndex === index) setMainImageIndex(null);
    else if (mainImageIndex !== null && mainImageIndex > index) setMainImageIndex(mainImageIndex - 1);
  };

  const existingImages = (initialData?.images || []).filter((img) => !deletedImages.includes(img.id));
  const totalSlots = existingImages.length + files.length;

  return (
    <div>
      <label className="block text-sm mb-1 font-medium">Foto Properti</label>
      <p className="text-xs text-muted-foreground mb-3">Format: JPG/PNG · Ukuran: 50KB – 5MB per foto · Resolusi minimal: 800×600px · Maks. 10 foto</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 mb-2">
        {existingImages.map((img) => (
          <div key={img.id} className={`relative aspect-square border rounded-lg overflow-hidden group ${mainImageId === img.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="prop" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {mainImageId !== img.id && (
                <button type="button" onClick={() => { setMainImageId(img.id); setMainImageIndex(null); }} className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-sm transition-colors" title="Jadikan Utama">
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button type="button" onClick={() => { setDeletedImages([...deletedImages, img.id]); if (mainImageId === img.id) setMainImageId(null); }} className="bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full shadow-sm transition-colors" title="Hapus">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {mainImageId === img.id && <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md shadow-md" title="Foto Utama"><Star className="w-3.5 h-3.5 fill-current" /></div>}
          </div>
        ))}
        {files.map((file, i) => {
          const isMain = mainImageIndex === i;
          const objectUrl = URL.createObjectURL(file);
          return (
            <div key={i} className={`relative aspect-square border rounded-lg overflow-hidden group ${isMain ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={objectUrl} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" onLoad={() => URL.revokeObjectURL(objectUrl)} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!isMain && <button type="button" onClick={() => { setMainImageIndex(i); setMainImageId(null); }} className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-sm transition-colors" title="Jadikan Utama"><Star className="w-4 h-4" /></button>}
                <button type="button" onClick={() => removeNewFile(i)} className="bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full shadow-sm transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
              </div>
              {isMain && <div className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground p-1 rounded-md shadow-md" title="Foto Utama"><Star className="w-3.5 h-3.5 fill-current" /></div>}
            </div>
          );
        })}
        {totalSlots < 10 && (
          <label className="relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors text-muted-foreground group">
            <div className="bg-muted group-hover:bg-primary/10 p-2 rounded-full mb-1 transition-colors"><Plus className="w-5 h-5 group-hover:text-primary transition-colors" /></div>
            <span className="text-[10px] font-medium uppercase tracking-wider group-hover:text-primary transition-colors">Tambah</span>
            <input type="file" multiple accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} disabled={loading} />
          </label>
        )}
      </div>
    </div>
  );
}
