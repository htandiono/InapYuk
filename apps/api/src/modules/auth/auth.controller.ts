import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/api-response';
import { registerUser, registerTenant, verifyEmail, resendVerification, login } from './auth.service';
import type { RegisterUserInput, RegisterTenantInput, VerifyEmailInput, ResendVerificationInput, LoginInput } from './auth.schema';
import { env, isProduction } from '../../config/env';

export async function handleRegisterUser(req: Request, res: Response) {
  const input = req.body as RegisterUserInput;
  const user = await registerUser(input);

  sendCreated(res, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }, 'Pendaftaran berhasil, periksa email Anda');
}

export async function handleRegisterTenant(req: Request, res: Response) {
  const input = req.body as RegisterTenantInput;
  const user = await registerTenant(input);

  sendCreated(res, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }, 'Pendaftaran tenant berhasil, periksa email Anda');
}

export async function handleVerifyEmail(req: Request, res: Response) {
  const input = req.body as VerifyEmailInput;
  await verifyEmail(input);

  sendSuccess(res, null, 'Akun berhasil diverifikasi, silakan login');
}

export async function handleResendVerification(req: Request, res: Response) {
  const input = req.body as ResendVerificationInput;
  await resendVerification(input);

  sendSuccess(res, null, 'Jika email terdaftar dan belum terverifikasi, kami sudah mengirim link baru');
}

export async function handleLogin(req: Request, res: Response) {
  const input = req.body as LoginInput;
  const { tokens, user } = await login(input);

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
  };

  // 15 minutes in MS
  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // 7 days in MS
  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, user, 'Login berhasil');
}
