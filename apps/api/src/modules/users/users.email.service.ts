import crypto from 'node:crypto';
import { prisma } from '../../libs/prisma';
import { hashToken } from '../../libs/password';
import { sendMail } from '../../libs/mailer';
import { badRequest, conflict } from '../../utils/app-error';
import { env } from '../../config/env';
import type { RequestEmailChangeInput, VerifyEmailChangeInput } from './users.schema';

async function createEmailChangeToken(userId: string, newEmail: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  await prisma.verificationToken.create({
    data: { userId, tokenHash: hashToken(rawToken), type: 'EMAIL_CHANGE', newEmail, expiresAt: new Date(Date.now() + 3600000) },
  });
  return rawToken;
}

export async function requestEmailChange(userId: string, input: RequestEmailChangeInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('Email sudah terdaftar');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('Pengguna tidak ditemukan');

  const rawToken = await createEmailChangeToken(userId, input.email);
  await sendMail({
    to: input.email,
    subject: 'Konfirmasi Perubahan Email',
    template: 'email-change',
    context: { name: user.name, verifyLink: `${env.WEB_BASE_URL}/email-change/verify?token=${rawToken}` },
  });
}
export async function verifyEmailChange(userId: string, input: VerifyEmailChangeInput) {
  const token = await prisma.verificationToken.findFirst({
    where: { userId, tokenHash: hashToken(input.token), type: 'EMAIL_CHANGE', usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!token || !token.newEmail) throw badRequest('Token tidak valid atau sudah kedaluwarsa');

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { email: token.newEmail, isVerified: true } }),
    prisma.verificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);
}
