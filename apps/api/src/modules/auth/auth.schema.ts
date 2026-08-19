import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  name: z.string().min(1, 'Nama tidak boleh kosong'),
});

export const registerTenantSchema = registerUserSchema.extend({
  companyName: z.string().min(1, 'Nama perusahaan tidak boleh kosong'),
});

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial');

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1, 'Token tidak valid'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

export const resendVerificationSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type RegisterTenantInput = z.infer<typeof registerTenantSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
