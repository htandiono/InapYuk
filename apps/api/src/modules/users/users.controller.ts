import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/api-response';
import { prisma } from '../../libs/prisma';
import { updateProfile } from './users.service';
import { requestEmailChange, verifyEmailChange } from './users.email.service';
import { changePassword } from './users.password.service';
import { linkGoogleAccount } from './users.google.service';
import type {
  UpdateProfileInput,
  RequestEmailChangeInput,
  VerifyEmailChangeInput,
  ChangePasswordInput,
} from './users.schema';

export async function handleGetProfile(req: Request, res: Response) {
  const userId = req.user!.sub;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      isVerified: true,
      provider: true,
    },
  });
  sendSuccess(res, user, 'Berhasil mengambil profil');
}

export async function handleUpdateProfile(req: Request, res: Response) {
  const userId = req.user!.sub;
  const user = await updateProfile(userId, req.body as UpdateProfileInput, req.file);
  sendSuccess(res, user, 'Profil berhasil diperbarui');
}

export async function handleRequestEmailChange(req: Request, res: Response) {
  const userId = req.user!.sub;
  await requestEmailChange(userId, req.body as RequestEmailChangeInput);
  sendSuccess(res, null, 'Link konfirmasi telah dikirim ke email baru Anda');
}

export async function handleVerifyEmailChange(req: Request, res: Response) {
  const userId = req.user!.sub;
  await verifyEmailChange(userId, req.body as VerifyEmailChangeInput);
  sendSuccess(res, null, 'Email berhasil diperbarui');
}

export async function handleChangePassword(req: Request, res: Response) {
  const userId = req.user!.sub;
  await changePassword(userId, req.body as ChangePasswordInput);
  sendSuccess(res, null, 'Password berhasil diubah');
}

export async function handleLinkGoogle(req: Request, res: Response) {
  const userId = req.user!.sub;
  await linkGoogleAccount(userId, req.body.token);
  sendSuccess(res, null, 'Akun Google berhasil ditautkan');
}
