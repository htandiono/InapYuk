import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  name: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 karakter')
    .regex(/^[a-zA-Z0-9\s.,'-]+$/, 'Nama mengandung karakter yang tidak valid'),
});

export const registerTenantSchema = registerUserSchema.extend({
  companyName: z
    .string()
    .trim()
    .min(3, 'Nama perusahaan minimal 3 karakter')
    .regex(/^[a-zA-Z0-9\s.,'-]+$/, 'Nama perusahaan mengandung karakter yang tidak valid'),
  companyAddress: z.string().trim().min(5, 'Alamat perusahaan minimal 5 karakter'),
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

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
  role: z.enum(['USER', 'TENANT']).optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type RegisterTenantInput = z.infer<typeof registerTenantSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
