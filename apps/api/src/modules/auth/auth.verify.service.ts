import { env } from '../../config/env';
import { sendMail } from '../../libs/mailer';
import { hashPassword, hashToken } from '../../libs/password';
import { prisma } from '../../libs/prisma';
import { badRequest } from '../../utils/app-error';
import { createTokenData } from './auth.utils';
import type { ResendVerificationInput, VerifyEmailInput } from './auth.schema';

export async function verifyEmail(input: VerifyEmailInput) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.type !== 'EMAIL_VERIFICATION') {
    throw badRequest('Link verifikasi tidak valid atau sudah kedaluwarsa');
  }
  if (tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
    throw badRequest('Link verifikasi tidak valid atau sudah kedaluwarsa');
  }
  if (tokenRecord.user.isVerified) {
    throw badRequest('Akun ini sudah diverifikasi sebelumnya');
  }

  const hashedPw = await hashPassword(input.password);
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({ where: { id: tokenRecord.userId }, data: { isVerified: true, passwordHash: hashedPw } }),
    prisma.verificationToken.updateMany({ where: { userId: tokenRecord.userId, type: 'EMAIL_VERIFICATION' }, data: { usedAt: new Date() } }),
  ]);
  return { role: updatedUser.role };
}

export async function resendVerification(input: ResendVerificationInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.isVerified) return;

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
