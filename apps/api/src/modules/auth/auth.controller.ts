import type { Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/api-response';
import type {
  LoginInput,
  RegisterTenantInput,
  RegisterUserInput,
  ResendVerificationInput,
  VerifyEmailInput,
  ResetPasswordInput,
  ConfirmResetPasswordInput,
} from './auth.schema';
import { registerTenant, registerUser } from './auth.service';
import { resendVerification, verifyEmail, checkToken } from './auth.verify.service';
import { login, logout, refreshAccessToken } from './auth.session.service';
import { requestPasswordReset, confirmPasswordReset, checkResetToken } from './auth.reset.service';
import { loginWithGoogle } from './auth.google.service';
import type { GoogleAuthInput } from './auth.schema';

import { cookieOpts } from '../../config/cookie';

function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('accessToken', tokens.accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOpts,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken', cookieOpts);
  res.clearCookie('refreshToken', cookieOpts);
}

export async function handleRegisterUser(req: Request, res: Response) {
  const user = await registerUser(req.body as RegisterUserInput);
  sendCreated(
    res,
    { id: user.id, email: user.email, name: user.name, role: user.role },
    'Pendaftaran berhasil, periksa email Anda',
  );
}

export async function handleRegisterTenant(req: Request, res: Response) {
  const user = await registerTenant(req.body as RegisterTenantInput);
  sendCreated(
    res,
    { id: user.id, email: user.email, name: user.name, role: user.role },
    'Pendaftaran tenant berhasil, periksa email Anda',
  );
}

export async function handleVerifyEmail(req: Request, res: Response) {
  const { role } = await verifyEmail(req.body as VerifyEmailInput);
  sendSuccess(res, { role }, 'Akun berhasil diverifikasi, silakan login');
}

export async function handleCheckToken(req: Request, res: Response) {
  if (!req.query.token)
    return res.status(400).json({ success: false, message: 'Token is required' });
  await checkToken(req.query.token as string);
  sendSuccess(res, null, 'Token valid');
}

export async function handleResendVerification(req: Request, res: Response) {
  await resendVerification(req.body as ResendVerificationInput);
  sendSuccess(
    res,
    null,
    'Jika email terdaftar dan belum terverifikasi, kami sudah mengirim link baru',
  );
}

export async function handleLogin(req: Request, res: Response) {
  const { tokens, user } = await login(req.body as LoginInput);
  setAuthCookies(res, tokens);
  sendSuccess(res, user, 'Login berhasil');
}

export async function handleRefreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new Error('No token');
    const tokens = await refreshAccessToken(refreshToken);
    setAuthCookies(res, tokens);
    sendSuccess(res, null, 'Token berhasil diperbarui');
  } catch {
    clearAuthCookies(res);
    res
      .status(401)
      .json({ success: false, message: 'Sesi Anda telah berakhir, silakan login kembali' });
  }
}

export async function handleLogout(req: Request, res: Response) {
  await logout(req.cookies.refreshToken);
  clearAuthCookies(res);
  sendSuccess(res, null, 'Berhasil logout');
}

export async function handleResetPasswordRequest(req: Request, res: Response) {
  await requestPasswordReset(req.body as ResetPasswordInput);
  sendSuccess(res, null, 'Jika email terdaftar, kami telah mengirimkan link reset');
}

export async function handleCheckResetToken(req: Request, res: Response) {
  if (!req.query.token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }
  await checkResetToken(req.query.token as string);
  sendSuccess(res, null, 'Token valid');
}

export async function handleConfirmResetPassword(req: Request, res: Response) {
  const { role } = await confirmPasswordReset(req.body as ConfirmResetPasswordInput);
  clearAuthCookies(res);
  sendSuccess(res, { role }, 'Password berhasil diubah, silakan login');
}

export async function handleGoogleAuth(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await loginWithGoogle(req.body as GoogleAuthInput);
  setAuthCookies(res, { accessToken, refreshToken });
  sendSuccess(res, user, 'Login Google berhasil');
}
