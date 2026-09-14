import crypto from 'node:crypto';
import { prisma } from '../../libs/prisma';
import { hashToken, hashPassword } from '../../libs/password';
import { sendMail } from '../../libs/mailer';
import { badRequest } from '../../utils/app-error';
import { env } from '../../config/env';
import type { ResetPasswordInput, ConfirmResetPasswordInput } from './auth.schema';

export async function requestPasswordReset(input: ResetPasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // OWASP: Do not reveal if the email is registered or if it's a social login.
  if (!user || user.provider === 'GOOGLE') {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashedToken,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetLink = `${env.FRONTEND_URL}/reset-password/confirm?token=${rawToken}`;

  await sendMail({
    to: user.email,
    subject: 'Reset Password Anda',
    template: 'password-reset',
    context: {
      name: user.name,
      resetLink,
    },
  });
}

export async function confirmPasswordReset(input: ConfirmResetPasswordInput): Promise<void> {
  const hashedToken = hashToken(input.token);

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      tokenHash: hashedToken,
      type: 'PASSWORD_RESET',
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!verificationToken) {
    throw badRequest('Token tidak valid atau kedaluwarsa');
  }

  const hashedPassword = await hashPassword(input.password);

  await prisma.$transaction(async (tx) => {
    // 1. Update password
    await tx.user.update({
      where: { id: verificationToken.userId },
      data: { passwordHash: hashedPassword },
    });

    // 2. Mark token as used
    await tx.verificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    // 3. Revoke all active sessions
    await tx.refreshToken.deleteMany({
      where: { userId: verificationToken.userId },
    });
  });
}
