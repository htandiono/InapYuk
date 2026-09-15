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
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    },
  });
  return rawToken;
}

export async function requestPasswordReset(input: ResetPasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.provider === 'GOOGLE') return;
  const rawToken = await createResetToken(user.id);
  await sendMail({
    to: user.email,
    subject: 'Reset Password Anda',
    template: 'password-reset',
    context: { name: user.name, resetLink: `${env.WEB_BASE_URL}/reset-password/confirm?token=${rawToken}` },
  });
}
export async function confirmPasswordReset(input: ConfirmResetPasswordInput): Promise<void> {
  const token = await prisma.verificationToken.findFirst({
    where: { tokenHash: hashToken(input.token), type: 'PASSWORD_RESET', usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!token) throw badRequest('Token tidak valid atau kedaluwarsa');
  
  const hashedPassword = await hashPassword(input.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash: hashedPassword } }),
    prisma.verificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.deleteMany({ where: { userId: token.userId } }),
  ]);
}
