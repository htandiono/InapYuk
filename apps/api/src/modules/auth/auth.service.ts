import { env } from '../../config/env';
import { sendMail } from '../../libs/mailer';
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

function sendVerificationEmail(email: string, name: string, token: string, isTenant: boolean) {
  const verificationUrl = `${env.WEB_BASE_URL}/verify?token=${token}`;
  sendMail({
    to: email,
    subject: isTenant ? 'Verifikasi Akun InapYuk (Tenant)' : 'Verifikasi Akun InapYuk',
    template: 'email-verification',
    context: { name, verificationUrl, expiresInMinutes: env.VERIFICATION_TOKEN_TTL_MINUTES },
  }).catch(() => {});
}

import type { Prisma } from '../../generated/prisma/client';

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

  const { user } = await prisma.$transaction(async (tx) => {
    const data: Prisma.UserCreateInput = {
      email: input.email,
      name: input.name,
      role: 'USER',
      provider: 'EMAIL',
      isVerified: false,
    };
    return createUserAndToken(tx, data, { tokenHash, expiresAt });
  });

  sendVerificationEmail(user.email, user.name, rawToken, false);
  return user;
}

export async function registerTenant(input: RegisterTenantInput) {
  await handleExistingUser(input.email);
  const { rawToken, tokenHash, expiresAt } = createTokenData();

  const { user } = await prisma.$transaction(async (tx) => {
    const data: Prisma.UserCreateInput = {
      email: input.email,
      name: input.name,
      role: 'TENANT',
      provider: 'EMAIL',
      isVerified: false,
    };
    const result = await createUserAndToken(tx, data, { tokenHash, expiresAt });
    await tx.tenantProfile.create({
      data: {
        userId: result.user.id,
        companyName: input.companyName,
        companyAddress: input.companyAddress,
      },
    });
    return result;
  });

  sendVerificationEmail(user.email, user.name, rawToken, true);
  return user;
}
