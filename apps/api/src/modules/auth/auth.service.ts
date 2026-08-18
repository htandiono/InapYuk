import crypto from 'node:crypto';
import { prisma } from '../../libs/prisma';
import { sendMail } from '../../libs/mailer';
import { conflict } from '../../utils/app-error';
import { env } from '../../config/env';
import type { RegisterUserInput } from './auth.schema';
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
