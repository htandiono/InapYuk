import { prisma } from '../../libs/prisma';
import { verifyGoogleToken } from '../../libs/google';
import { badRequest, unauthorized } from '../../utils/app-error';

async function verifyGoogleTokenForLink(token: string) {
  try {
    const payload = await verifyGoogleToken(token);
    if (!payload || !payload.email) throw unauthorized('Gagal membaca informasi profil dari Google');
    return payload;
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode === 401) throw err;
    throw unauthorized('Token Google tidak valid');
  }
}

export async function linkGoogleAccount(userId: string, token: string) {
  const payload = await verifyGoogleTokenForLink(token);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('Pengguna tidak ditemukan');
  if (user.email !== payload.email) throw badRequest('Email akun Google berbeda dengan email akun InapYuk Anda');
  await prisma.user.update({ where: { id: userId }, data: { provider: 'GOOGLE', providerId: payload.sub } });
}
