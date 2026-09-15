import { prisma } from '../../libs/prisma';
import { verifyGoogleToken } from '../../libs/google';
import { badRequest, unauthorized } from '../../utils/app-error';

export async function linkGoogleAccount(userId: string, token: string) {
  let payload;
  try {
    payload = await verifyGoogleToken(token);
  } catch {
    throw unauthorized('Token Google tidak valid');
  }

  if (!payload || !payload.email) {
    throw unauthorized('Gagal membaca informasi profil dari Google');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('Pengguna tidak ditemukan');

  if (user.email !== payload.email) {
    throw badRequest('Email akun Google berbeda dengan email akun InapYuk Anda');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      provider: 'GOOGLE',
      providerId: payload.sub,
    },
  });
}
