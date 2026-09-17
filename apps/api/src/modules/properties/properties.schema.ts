import { z } from 'zod';

export const getPropertiesQuerySchema = z
  .object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(12),
    city: z.string().optional(),
    checkIn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
      .optional(),
    checkOut: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
      .optional(),
    guests: z.coerce.number().min(1).max(30).optional().default(2),
    name: z.string().optional(),
    category: z.string().optional(),
    sortBy: z.enum(['name', 'price']).optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  })
  .refine(
    (data) => {
      if ((data.checkIn && !data.checkOut) || (!data.checkIn && data.checkOut)) {
        return false;
      }
      return true;
    },
    {
      message: 'checkIn and checkOut must be provided together',
      path: ['checkIn'],
    },
  )
  .refine(
    (data) => {
      if (data.checkIn) {
        const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .split('T')[0];
        return data.checkIn >= todayStr;
      }
      return true;
    },
    {
      message: 'checkIn cannot be in the past',
      path: ['checkIn'],
    },
  )
  .refine(
    (data) => {
      if (data.checkIn && data.checkOut) {
        return data.checkOut > data.checkIn;
      }
      return true;
    },
    {
      message: 'checkOut must be after checkIn',
      path: ['checkOut'],
    },
  );

export type GetPropertiesQuery = z.infer<typeof getPropertiesQuerySchema>;

export const getPropertyPricingSchema = z.object({
  roomId: z.string().uuid('Invalid Room ID'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020),
});

export type GetPropertyPricingQuery = z.infer<typeof getPropertyPricingSchema>;

export const CreatePropertySchema = z.object({
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
  address: z
    .string()
    .min(5, 'Alamat lengkap harus terdiri dari minimal 5 karakter.')
    .max(150, 'Alamat lengkap tidak boleh lebih dari 150 karakter.'),
  city: z
    .string()
    .min(3, 'Nama kota harus terdiri dari minimal 3 karakter.')
    .max(150, 'Nama kota tidak boleh lebih dari 150 karakter.'),
  state: z
    .string()
    .min(3, 'Nama provinsi harus terdiri dari minimal 3 karakter.')
    .max(150, 'Nama provinsi tidak boleh lebih dari 150 karakter.'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  mainImageIndex: z.coerce.number().optional(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial().extend({
  deletedImages: z.string().optional(), // JSON array of IDs
  mainImageId: z.string().optional(),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
