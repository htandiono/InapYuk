import { env } from '../../config/env';
import { issueTokens, verifyRefreshToken } from '../../libs/jwt';
import { hashToken, verifyPassword } from '../../libs/password';
import { prisma } from '../../libs/prisma';
import { unauthorized } from '../../utils/app-error';
import type { LoginInput } from './auth.schema';
import type { UserRole } from '@inapyuk/types';

async function validateUserCredentials(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.passwordHash || (input.role && user.role !== input.role)) {
    throw unauthorized('Email atau password salah');
  }
  const isMatch = await verifyPassword(input.password, user.passwordHash);
  if (!isMatch) throw unauthorized('Email atau password salah');
  return user;
}

type TokenUser = { id: string; name: string; role: UserRole; email: string; isVerified: boolean };

function getRefreshExpiry() {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function createSessionTokens(user: TokenUser) {
  const tokens = issueTokens({
    sub: user.id, name: user.name, role: user.role, email: user.email, isVerified: user.isVerified,
  });
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(tokens.refreshToken), expiresAt: getRefreshExpiry() },
  });
  return tokens;
}

export async function login(input: LoginInput) {
  const user = await validateUserCredentials(input);
  const tokens = await createSessionTokens(user);

  return {
    tokens,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

async function verifyAndFindToken(token: string) {
  verifyRefreshToken(token);
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw unauthorized('Sesi Anda telah berakhir, silakan login kembali');
  }
  return tokenRecord;
}

async function rotateTokens(tokenRecord: { id: string; user: TokenUser }) {
  const tokens = issueTokens({
    sub: tokenRecord.user.id, name: tokenRecord.user.name, role: tokenRecord.user.role, 
    email: tokenRecord.user.email, isVerified: tokenRecord.user.isVerified,
  });
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: tokenRecord.id } }),
    prisma.refreshToken.create({
      data: { userId: tokenRecord.user.id, tokenHash: hashToken(tokens.refreshToken), expiresAt: getRefreshExpiry() },
    }),
  ]);
  return tokens;
}

export async function refreshAccessToken(token: string) {
  const tokenRecord = await verifyAndFindToken(token);
  return rotateTokens(tokenRecord);
}

export async function logout(token: string | undefined) {
  if (!token) return;
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(token) },
  });
}
