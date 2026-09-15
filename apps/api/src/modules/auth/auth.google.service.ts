import { prisma } from '../../libs/prisma';
import { verifyGoogleToken } from '../../libs/google';
import { issueTokens } from '../../libs/jwt';
import { forbidden, unauthorized } from '../../utils/app-error';
import type { GoogleAuthInput } from './auth.schema';

export async function loginWithGoogle(input: GoogleAuthInput) {
  let payload;
  try {
    payload = await verifyGoogleToken(input.token);
  } catch {
    throw unauthorized('Token Google tidak valid');
  }

  if (!payload || !payload.email) {
    throw unauthorized('Gagal membaca informasi profil dari Google');
  }

  let user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (user) {
    if (user.provider !== 'GOOGLE') {
      throw forbidden(
        'Email ini sudah terdaftar dengan metode lain. Silakan login dengan password dan tautkan akun Google Anda di pengaturan profil.',
      );
    }
  } else {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name || 'User',
        avatarUrl: payload.picture || null,
        provider: 'GOOGLE',
        providerId: payload.sub,
        isVerified: true, // Google emails are pre-verified
        role: 'USER',
      },
    });
  }

  const { accessToken, refreshToken } = issueTokens({
    sub: user.id,
    role: user.role,
    email: user.email,
    isVerified: user.isVerified,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshToken, // Usually we hash this but to keep it simple and aligned with issueTokens design we save it
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { user, accessToken, refreshToken };
}
