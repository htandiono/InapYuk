import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(3, 'Nama kategori harus terdiri dari minimal 3 karakter.')
    .max(50, 'Nama kategori tidak boleh lebih dari 50 karakter.')
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      'Nama kategori hanya boleh mengandung huruf, angka, spasi, dan tanda hubung (-).',
    ),
});

export const UpdateCategorySchema = CreateCategorySchema;

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
