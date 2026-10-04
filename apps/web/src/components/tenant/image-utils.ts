import { toast } from 'sonner';

const MIN_SIZE_BYTES = 50 * 1024;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const MAX_IMAGES = 10;

export function validateImageDimensions(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        toast.error(
          `${file.name}: Resolusi terlalu kecil (${width}×${height}px). Minimal ${MIN_WIDTH}×${MIN_HEIGHT}px.`,
          { duration: 5000 },
        );
        resolve(false);
        return;
      }
      if (width < height) {
        toast.warning(
          `${file.name}: Foto portrait kurang optimal. Gunakan foto landscape (horizontal) untuk tampilan terbaik.`,
          { duration: 5000 },
        );
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
}

export function filterValidFiles(files: File[]): File[] {
  return files.filter((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: Format tidak didukung. Gunakan .jpg atau .png.`);
      return false;
    }
    if (file.size < MIN_SIZE_BYTES) {
      toast.error(
        `${file.name}: Ukuran file terlalu kecil (min. 50KB). Gunakan foto berkualitas tinggi.`,
        { duration: 5000 },
      );
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`${file.name}: Ukuran file terlalu besar (maks. 5MB).`);
      return false;
    }
    return true;
  });
}

export function checkImageCount(
  existingCount: number,
  deletedCount: number,
  currentCount: number,
  newCount: number,
): boolean {
  if (existingCount - deletedCount + currentCount + newCount > MAX_IMAGES) {
    toast.error('Maksimal 10 gambar diperbolehkan');
    return false;
  }
  return true;
}
