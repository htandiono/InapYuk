import { env } from '../../config/env';
import { sendMail } from '../../libs/mailer';
import { hashPassword, hashToken } from '../../libs/password';
import { prisma } from '../../libs/prisma';
import { badRequest } from '../../utils/app-error';
import { createTokenData } from './auth.utils';
import type { ResendVerificationInput, VerifyEmailInput } from './auth.schema';

async function validateTokenRecord(tokenRecord: any) {
  if (!tokenRecord || tokenRecord.type !== 'EMAIL_VERIFICATION') {
    throw badRequest('Link verifikasi tidak valid atau sudah kedaluwarsa');
  }

  if (tokenRecord.user.isVerified) {
    throw badRequest('Akun ini sudah diverifikasi sebelumnya');
  }

  const latestToken = await prisma.verificationToken.findFirst({
    where: { userId: tokenRecord.userId, type: 'EMAIL_VERIFICATION' },
    orderBy: { createdAt: 'desc' },
  });

  if (latestToken && latestToken.id !== tokenRecord.id) {
    throw badRequest('Link ini tidak valid karena Anda telah meminta link baru. Harap gunakan link verifikasi yang paling baru dari email Anda.');
  }

  if (tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
    throw badRequest('Link verifikasi tidak valid atau sudah kedaluwarsa');
  }
}

export async function verifyEmail(input: VerifyEmailInput) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
    include: { user: true },
  });

  await validateTokenRecord(tokenRecord);

  const hashedPw = await hashPassword(input.password);
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({ where: { id: tokenRecord.userId }, data: { isVerified: true, passwordHash: hashedPw } }),
    prisma.verificationToken.updateMany({ where: { userId: tokenRecord.userId, type: 'EMAIL_VERIFICATION' }, data: { usedAt: new Date() } }),
  ]);
  return { role: updatedUser.role };
}

export async function checkToken(token: string) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  await validateTokenRecord(tokenRecord);

  return { success: true };
}

export async function resendVerification(input: ResendVerificationInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) return; // Silent return for non-existent users (enumeration defense)
  if (user.isVerified) {
    throw badRequest('Akun ini sudah diverifikasi sebelumnya');
  }

  const { rawToken, tokenHash, expiresAt } = createTokenData();
  await prisma.verificationToken.create({
    data: { userId: user.id, type: 'EMAIL_VERIFICATION', tokenHash, expiresAt },
  });

  const verificationUrl = `${env.WEB_BASE_URL}/verify?token=${rawToken}`;
  sendMail({
    to: user.email,
    subject: 'Verifikasi Akun InapYuk',
    template: 'email-verification',
    context: { name: user.name, verificationUrl, expiresInMinutes: env.VERIFICATION_TOKEN_TTL_MINUTES },
  }).catch(() => {});
}
