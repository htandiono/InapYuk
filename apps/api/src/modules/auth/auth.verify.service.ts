import { env } from '../../config/env';
import { sendMail } from '../../libs/mailer';
import { logger } from '../../libs/logger';
import { hashPassword, hashToken } from '../../libs/password';
import { prisma } from '../../libs/prisma';
import { badRequest } from '../../utils/app-error';
import { createTokenData } from './auth.utils';
import type { ResendVerificationInput, VerifyEmailInput } from './auth.schema';
import type { User, VerificationToken } from '../../generated/prisma/client';

async function validateTokenRecord(t: (VerificationToken & { user: User }) | null) {
  if (!t || t.type !== 'EMAIL_VERIFICATION') throw badRequest('Link verifikasi tidak valid atau sudah kedaluwarsa');
  if (t.user.isVerified) throw badRequest('Akun ini sudah diverifikasi sebelumnya');

  const latest = await prisma.verificationToken.findFirst({
    where: { userId: t.userId, type: 'EMAIL_VERIFICATION' },
    orderBy: { createdAt: 'desc' },
  });
  if (latest && latest.id !== t.id)
    throw badRequest('Link ini tidak valid karena Anda telah meminta link baru. Harap gunakan link verifikasi yang paling baru dari email Anda.');

  if (t.usedAt !== null || t.expiresAt < new Date())
    throw badRequest('Link verifikasi tidak valid atau sudah kedaluwarsa');
}

export async function verifyEmail(input: VerifyEmailInput) {
  const t = await prisma.verificationToken.findUnique({ where: { tokenHash: hashToken(input.token) }, include: { user: true } });
  await validateTokenRecord(t);
  const hashedPw = await hashPassword(input.password);
  const [u] = await prisma.$transaction([
    prisma.user.update({ where: { id: t!.userId }, data: { isVerified: true, passwordHash: hashedPw } }),
    prisma.verificationToken.updateMany({ where: { userId: t!.userId, type: 'EMAIL_VERIFICATION' }, data: { usedAt: new Date() } }),
  ]);
  return { role: u.role };
}

export async function checkToken(token: string) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  await validateTokenRecord(tokenRecord);
  return { success: true };
}

async function sendVerificationEmail(user: User, rawToken: string): Promise<void> {
  const verificationUrl = `${env.WEB_BASE_URL}/verify?token=${rawToken}`;
  await sendMail({
    to: user.email,
    subject: 'Verifikasi Akun InapYuk',
    template: 'email-verification',
    context: {
      name: user.name,
      verificationUrl,
      expiresInMinutes: env.VERIFICATION_TOKEN_TTL_MINUTES,
    },
  }).catch((err) => {
    logger.error(`[MailError] Failed to resend verification email to ${user.email}`, err);
  });
}

export async function resendVerification(input: ResendVerificationInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.isVerified) return;

  const { rawToken, tokenHash, expiresAt } = createTokenData();
  await prisma.verificationToken.create({
    data: { userId: user.id, type: 'EMAIL_VERIFICATION', tokenHash, expiresAt },
  });

  await sendVerificationEmail(user, rawToken);
}
