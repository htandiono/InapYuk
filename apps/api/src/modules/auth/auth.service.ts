import crypto from 'node:crypto';
import { prisma } from '../../libs/prisma';
import { sendMail } from '../../libs/mailer';
import { badRequest, conflict } from '../../utils/app-error';
import { env } from '../../config/env';
import { hashToken, hashPassword } from '../../libs/password';
import type { RegisterUserInput, RegisterTenantInput, VerifyEmailInput } from './auth.schema';
import type { User, VerificationToken } from '../../generated/prisma/client';

/**
 * Creates a raw token string and its SHA-256 hash.
 * The raw token is sent to the user; the hash is stored in the DB.
 */
function createTokenData() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + env.VERIFICATION_TOKEN_TTL_MINUTES * 60 * 1000);
  return { rawToken, tokenHash, expiresAt };
}

export async function registerUser(input: RegisterUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw conflict('Email sudah terdaftar');
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
  }).catch((err) => {
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
    throw conflict('Email sudah terdaftar');
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
  }).catch((err) => {
    // Swallowed mail error
  });

  return result.user;
}

export async function verifyEmail(input: VerifyEmailInput) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });

  if (!tokenRecord || tokenRecord.type !== 'EMAIL_VERIFICATION') {
    throw badRequest('Link verifikasi tidak valid atau sudah kedaluwarsa');
  }

  if (tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
    throw badRequest('Link verifikasi tidak valid atau sudah kedaluwarsa');
  }

  const hashedPw = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { isVerified: true, passwordHash: hashedPw },
    }),
    prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
