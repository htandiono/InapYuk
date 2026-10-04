import * as z from 'zod';

export const propertySchema = z.object({
  name: z
    .string()
    .min(3, 'Nama properti harus terdiri dari minimal 3 karakter.')
    .max(100, 'Nama properti tidak boleh lebih dari 100 karakter.')
    .regex(
      /^[a-zA-Z0-9\s.,&'-]+$/,
      'Nama properti hanya boleh mengandung huruf, angka, spasi, koma, titik, ampersand (&), dan tanda hubung (-).',
    ),
  categoryId: z.string().min(1, 'Silakan pilih kategori properti terlebih dahulu.'),
  description: z
    .string()
    .min(10, 'Deskripsi properti harus terdiri dari minimal 10 karakter.')
    .max(1000, 'Deskripsi properti tidak boleh lebih dari 1000 karakter.'),
  city: z.string().min(1, 'Kota / Kabupaten harus dipilih.'),
  state: z.string().min(1, 'Provinsi harus dipilih.'),
  address: z
    .string()
    .min(5, 'Alamat lengkap harus terdiri dari minimal 5 karakter.')
    .max(150, 'Alamat lengkap tidak boleh lebih dari 150 karakter.'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

export type PropertyFormInitData = {
  id?: string;
  name?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  images?: { id: string; url: string }[];
};
