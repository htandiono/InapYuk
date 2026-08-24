import type { Request, Response } from 'express';
import { isProduction } from '../../config/env';
import { sendCreated, sendSuccess } from '../../utils/api-response';
import type {
  LoginInput,
  RegisterTenantInput,
  RegisterUserInput,
  ResendVerificationInput,
  VerifyEmailInput,
} from './auth.schema';
import {
  registerTenant,
  registerUser,
} from './auth.service';
import { resendVerification, verifyEmail, checkToken } from './auth.verify.service';
import { login, logout, refreshAccessToken } from './auth.session.service';

export async function handleRegisterUser(req: Request, res: Response) {
  const input = req.body as RegisterUserInput;
  const user = await registerUser(input);

  sendCreated(
    res,
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    'Pendaftaran berhasil, periksa email Anda',
  );
}

export async function handleRegisterTenant(req: Request, res: Response) {
  const input = req.body as RegisterTenantInput;
  const user = await registerTenant(input);

  sendCreated(
    res,
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    'Pendaftaran tenant berhasil, periksa email Anda',
  );
}

export async function handleVerifyEmail(req: Request, res: Response) {
  const input = req.body as VerifyEmailInput;
  const { role } = await verifyEmail(input);

  sendSuccess(res, { role }, 'Akun berhasil diverifikasi, silakan login');
}

export async function handleCheckToken(req: Request, res: Response) {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ success: false, message: 'Token is required' });
    return;
  }
  await checkToken(token);
  sendSuccess(res, null, 'Token valid');
}

export async function handleResendVerification(req: Request, res: Response) {
  const input = req.body as ResendVerificationInput;
  await resendVerification(input);

  sendSuccess(
    res,
    null,
    'Jika email terdaftar dan belum terverifikasi, kami sudah mengirim link baru',
  );
}

export async function handleLogin(req: Request, res: Response) {
  const input = req.body as LoginInput;
  const { tokens, user } = await login(input);

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
  };

  res.cookie('accessToken', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, user, 'Login berhasil');
}

export async function handleRefreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res
        .status(401)
        .json({ success: false, message: 'Sesi Anda telah berakhir, silakan login kembali' });
      return;
    }

    const tokens = await refreshAccessToken(refreshToken);

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, null, 'Token berhasil diperbarui');
  } catch {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res
      .status(401)
      .json({ success: false, message: 'Sesi Anda telah berakhir, silakan login kembali' });
  }
}

export async function handleLogout(req: Request, res: Response) {
  const { refreshToken } = req.cookies;

  await logout(refreshToken);

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  sendSuccess(res, null, 'Berhasil logout');
}
