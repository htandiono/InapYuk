import { z } from 'zod';

export const CreateRoomSchema = z.object({
  name: z.string().min(3, 'Nama kamar minimal 3 karakter.').max(100, 'Nama kamar tidak boleh lebih dari 100 karakter.').regex(/^[a-zA-Z0-9\s.,&'-]+$/, 'Nama kamar hanya boleh mengandung huruf, angka, spasi, koma, titik, ampersand (&), dan tanda hubung (-).'),
  description: z.string().min(10, 'Deskripsi kamar minimal 10 karakter.').max(1000, 'Deskripsi kamar tidak boleh lebih dari 1000 karakter.'),
  basePrice: z.coerce.number().min(50000, 'Harga dasar minimal Rp 50.000').max(100000000, 'Harga dasar maksimal Rp 100.000.000'),
  capacity: z.coerce.number().min(1, 'Kapasitas minimal 1 orang').max(20, 'Kapasitas maksimal 20 orang'),
  totalUnits: z.coerce.number().min(1, 'Total unit minimal 1').max(100, 'Total unit maksimal 100'),
  mainImageIndex: z.coerce.number().optional()
});

export const UpdateRoomSchema = CreateRoomSchema.partial().extend({
  deletedImages: z.string().optional(), // JSON array of IDs
  mainImageId: z.string().optional(),
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;
