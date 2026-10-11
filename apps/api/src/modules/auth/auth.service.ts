import { env } from '../../config/env';
import { sendMail } from '../../libs/mailer';
import { logger } from '../../libs/logger';
import { prisma } from '../../libs/prisma';
import { conflict } from '../../utils/app-error';
import type { RegisterTenantInput, RegisterUserInput } from './auth.schema';
import { createTokenData } from './auth.utils';

async function handleExistingUser(email: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    if (existingUser.isVerified) throw conflict('Email sudah terdaftar');
    await prisma.user.delete({ where: { id: existingUser.id } });
  }
}

type Recipient = { email: string; name: string };

// Awaited so the serverless runtime cannot freeze the function before the mail is sent.
async function sendVerificationEmail(user: Recipient, token: string, subject: string) {
  const verificationUrl = `${env.WEB_BASE_URL}/verify?token=${token}`;
  await sendMail({
    to: user.email,
    subject,
    template: 'email-verification',
    context: {
      name: user.name,
      verificationUrl,
      expiresInMinutes: env.VERIFICATION_TOKEN_TTL_MINUTES,
    },
  }).catch((err) => {
    logger.error(`[MailError] Failed to send verification email to ${user.email}`, err);
  });
}

import type { Prisma } from '../../generated/prisma/client';

function newUserData(input: Recipient, role: 'USER' | 'TENANT'): Prisma.UserCreateInput {
  return { email: input.email, name: input.name, role, provider: 'EMAIL', isVerified: false };
}

async function createUserAndToken(
  tx: Prisma.TransactionClient,
  data: Prisma.UserCreateInput,
  tokenData: { tokenHash: string; expiresAt: Date },
) {
  const user = await tx.user.create({ data });
  const token = await tx.verificationToken.create({
    data: { userId: user.id, type: 'EMAIL_VERIFICATION', ...tokenData },
  });
  return { user, token };
}

export async function registerUser(input: RegisterUserInput) {
  await handleExistingUser(input.email);
  const { rawToken, tokenHash, expiresAt } = createTokenData();
  const { user } = await prisma.$transaction((tx) =>
    createUserAndToken(tx, newUserData(input, 'USER'), { tokenHash, expiresAt }),
  );
  await sendVerificationEmail(user, rawToken, 'Verifikasi Akun InapYuk');
  return user;
}

async function createTenantWithProfile(
  tx: Prisma.TransactionClient,
  input: RegisterTenantInput,
  tokenData: { tokenHash: string; expiresAt: Date },
) {
  const result = await createUserAndToken(tx, newUserData(input, 'TENANT'), tokenData);
  const { companyName, companyAddress } = input;
  await tx.tenantProfile.create({
    data: { userId: result.user.id, companyName, companyAddress },
  });
  return result;
}

export async function registerTenant(input: RegisterTenantInput) {
  await handleExistingUser(input.email);
  const { rawToken, tokenHash, expiresAt } = createTokenData();
  const { user } = await prisma.$transaction((tx) =>
    createTenantWithProfile(tx, input, { tokenHash, expiresAt }),
  );
  await sendVerificationEmail(user, rawToken, 'Verifikasi Akun InapYuk (Tenant)');
  return user;
}
