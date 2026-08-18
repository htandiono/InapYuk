import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  name: z.string().min(1, 'Nama tidak boleh kosong'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
