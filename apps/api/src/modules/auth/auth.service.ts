import { env } from '../../config/env';
import { sendMail } from '../../libs/mailer';
import { prisma } from '../../libs/prisma';
import { conflict } from '../../utils/app-error';
import { createTokenData } from './auth.utils';
import type { RegisterTenantInput, RegisterUserInput } from './auth.schema';



export async function registerUser(input: RegisterUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw conflict('Email sudah terdaftar');
    }
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const { rawToken, tokenHash, expiresAt } = createTokenData();

  // Perform creation atomically
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: 'USER',
        provider: 'EMAIL',
        isVerified: false,
      },
    });

    const token = await tx.verificationToken.create({
      data: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        tokenHash,
        expiresAt,
      },
    });

    return { user, token };
  });

  const verificationUrl = `${env.WEB_BASE_URL}/verify?token=${rawToken}`;

  // Send email asynchronously (don't await so we don't block the response)
  sendMail({
    to: result.user.email,
    subject: 'Verifikasi Akun InapYuk',
    template: 'email-verification',
    context: {
      name: result.user.name,
      verificationUrl,
      expiresInMinutes: env.VERIFICATION_TOKEN_TTL_MINUTES,
    },
  }).catch((_err) => {
    // We swallow errors here because mail failure shouldn't fail registration.
    // In production, logger handles this.
  });

  return result.user;
}

export async function registerTenant(input: RegisterTenantInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw conflict('Email sudah terdaftar');
    }
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const { rawToken, tokenHash, expiresAt } = createTokenData();

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: 'TENANT',
        provider: 'EMAIL',
        isVerified: false,
      },
    });

    await tx.tenantProfile.create({
      data: {
        userId: user.id,
        companyName: input.companyName,
        companyAddress: input.companyAddress,
      },
    });

    const token = await tx.verificationToken.create({
      data: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        tokenHash,
        expiresAt,
      },
    });

    return { user, token };
  });

  const verificationUrl = `${env.WEB_BASE_URL}/verify?token=${rawToken}`;

  sendMail({
    to: result.user.email,
    subject: 'Verifikasi Akun InapYuk (Tenant)',
    template: 'email-verification',
    context: {
      name: result.user.name,
      verificationUrl,
      expiresInMinutes: env.VERIFICATION_TOKEN_TTL_MINUTES,
    },
  }).catch((_err) => {
    // Swallowed mail error
  });

  return result.user;
}



