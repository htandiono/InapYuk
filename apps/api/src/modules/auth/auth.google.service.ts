import { prisma } from '../../libs/prisma';
import { verifyGoogleToken } from '../../libs/google';
import { issueTokens } from '../../libs/jwt';
import { forbidden, unauthorized } from '../../utils/app-error';
import type { GoogleAuthInput } from './auth.schema';
import type { UserRole } from '@inapyuk/types';

async function verifyAndGetGooglePayload(token: string): Promise<{ email: string; name?: string; picture?: string; sub: string }> {
  try {
    const payload = await verifyGoogleToken(token);
    if (!payload || !payload.email) throw unauthorized('Gagal membaca informasi profil dari Google');
    return { email: payload.email, name: payload.name, picture: payload.picture, sub: payload.sub };
  } catch (err: unknown) {
    if ((err as { statusCode?: number }).statusCode === 401) throw err;
    throw unauthorized('Token Google tidak valid');
  }
}

async function findOrCreateGoogleUser(payload: { email: string; name?: string; picture?: string; sub: string }, role: string) {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (user) {
    if (user.provider !== 'GOOGLE')
      throw forbidden('Email ini sudah terdaftar dengan metode lain. Silakan login dengan password dan tautkan akun Google Anda di pengaturan profil.');
    return user;
  }
  return prisma.user.create({
    data: {
      email: payload.email, name: payload.name || 'User',
      avatarUrl: payload.picture || null, provider: 'GOOGLE',
      providerId: payload.sub, isVerified: true, role: role as UserRole,
    },
  });
}

export async function loginWithGoogle(input: GoogleAuthInput) {
  const payload = await verifyAndGetGooglePayload(input.token);
  const user = await findOrCreateGoogleUser(payload, input.role ?? 'USER');
  const { accessToken, refreshToken } = issueTokens({
    sub: user.id, name: user.name, role: user.role, email: user.email, isVerified: user.isVerified,
  });
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  return { user, accessToken, refreshToken };
}
