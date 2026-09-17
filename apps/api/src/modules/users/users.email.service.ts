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
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      type: 'EMAIL_CHANGE',
      newEmail,
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  return rawToken;
}

async function sendEmailChangeEmail(user: { name: string; email: string }, rawToken: string, newEmail: string): Promise<void> {
  const verifyLink = `${env.WEB_BASE_URL}/email-change/verify?token=${rawToken}`;
  await sendMail({
    to: newEmail,
    subject: 'Konfirmasi Perubahan Email',
    template: 'email-change',
    context: { name: user.name, verifyLink },
  });
}

export async function requestEmailChange(userId: string, input: RequestEmailChangeInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('Pengguna tidak ditemukan');

  if (user.email === input.email) {
    throw badRequest('Email baru tidak boleh sama dengan email saat ini');
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('Email sudah terdaftar');

  const rawToken = await createEmailChangeToken(userId, input.email);
  await sendEmailChangeEmail(user, rawToken, input.email);
}

async function validateEmailChangeToken(tokenStr: string) {
  const token = await prisma.verificationToken.findFirst({
    where: { tokenHash: hashToken(tokenStr), type: 'EMAIL_CHANGE', usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!token || !token.newEmail) throw badRequest('Token tidak valid atau sudah kedaluwarsa');
  const latestToken = await prisma.verificationToken.findFirst({
    where: { userId: token.userId, type: 'EMAIL_CHANGE' }, orderBy: { createdAt: 'desc' },
  });
  if (latestToken && latestToken.id !== token.id)
    throw badRequest('Link ini tidak valid karena Anda telah meminta link baru. Harap gunakan link verifikasi yang paling baru dari email Anda.');
  return token;
}

export async function verifyEmailChange(input: VerifyEmailChangeInput): Promise<{ role: string }> {
  const t = await validateEmailChangeToken(input.token);
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({ where: { id: t.userId }, data: { email: t.newEmail!, isVerified: true } }),
    prisma.verificationToken.update({ where: { id: t.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.deleteMany({ where: { userId: t.userId } }),
  ]);
  return { role: updatedUser.role };
}
