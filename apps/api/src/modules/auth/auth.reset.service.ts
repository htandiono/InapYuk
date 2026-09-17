import crypto from 'node:crypto';
import { prisma } from '../../libs/prisma';
import { hashToken, hashPassword } from '../../libs/password';
import { sendMail } from '../../libs/mailer';
import { badRequest } from '../../utils/app-error';
import { env } from '../../config/env';
import type { ResetPasswordInput, ConfirmResetPasswordInput } from './auth.schema';

async function createResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  await prisma.verificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  return rawToken;
}

async function checkRecentToken(userId: string) {
  return prisma.verificationToken.findFirst({
    where: { userId, type: 'PASSWORD_RESET', createdAt: { gt: new Date(Date.now() - 60000) } },
  });
}

function sendResetMail(email: string, name: string, token: string) {
  return sendMail({
    to: email, subject: 'Reset Password Anda', template: 'password-reset',
    context: { name, appName: 'InapYuk', resetUrl: `${env.WEB_BASE_URL}/reset-password/confirm?token=${token}`, expiresInMinutes: 60 },
  });
}

export async function requestPasswordReset(input: ResetPasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.provider === 'GOOGLE') return;
  if (await checkRecentToken(user.id)) return;
  const rawToken = await createResetToken(user.id);
  await sendResetMail(user.email, user.name, rawToken);
}

export async function checkResetToken(tokenString: string): Promise<void> {
  const token = await prisma.verificationToken.findFirst({
    where: {
      tokenHash: hashToken(tokenString),
      type: 'PASSWORD_RESET',
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (!token) throw badRequest('Token tidak valid atau sudah digunakan');
}

async function getValidResetToken(tokenStr: string) {
  const token = await prisma.verificationToken.findFirst({
    where: { tokenHash: hashToken(tokenStr), type: 'PASSWORD_RESET', usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!token) throw badRequest('Token tidak valid atau sudah kedaluwarsa');
  return token;
}

export async function confirmPasswordReset(input: ConfirmResetPasswordInput): Promise<{ role: string }> {
  const token = await getValidResetToken(input.token);
  const hashedPassword = await hashPassword(input.password);
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash: hashedPassword } }),
    prisma.verificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.deleteMany({ where: { userId: token.userId } }),
  ]);
  return { role: updatedUser.role };
}
