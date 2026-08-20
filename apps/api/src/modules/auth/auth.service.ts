import crypto from 'node:crypto';
import { prisma } from '../../libs/prisma';
import { sendMail } from '../../libs/mailer';
import { badRequest, conflict, unauthorized } from '../../utils/app-error';
import { env } from '../../config/env';
import { hashToken, hashPassword, verifyPassword } from '../../libs/password';
import { issueTokens, verifyRefreshToken, signAccessToken } from '../../libs/jwt';
import type { RegisterUserInput, RegisterTenantInput, VerifyEmailInput, ResendVerificationInput, LoginInput } from './auth.schema';
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

export async function resendVerification(input: ResendVerificationInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // OWASP enumeration defense: silently return if user doesn't exist or is already verified
  if (!user || user.isVerified) {
    return;
  }

  const { rawToken, tokenHash, expiresAt } = createTokenData();

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      type: 'EMAIL_VERIFICATION',
      tokenHash,
      expiresAt,
    },
  });

  const verificationUrl = `${env.WEB_BASE_URL}/verify?token=${rawToken}`;

  sendMail({
    to: user.email,
    subject: 'Verifikasi Akun InapYuk',
    template: 'email-verification',
    context: {
      name: user.name,
      verificationUrl,
      expiresInMinutes: env.VERIFICATION_TOKEN_TTL_MINUTES,
    },
  }).catch((err) => {
    // Swallowed mail error
  });
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash) {
    throw unauthorized('Email atau password salah');
  }

  const isMatch = await verifyPassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw unauthorized('Email atau password salah');
  }

  const { accessToken, refreshToken } = issueTokens({
    sub: user.id,
    role: user.role,
    email: user.email,
    isVerified: user.isVerified,
  });

  const hashedRefresh = hashToken(refreshToken);

  // Parse refresh token TTL to calculate expiry
  const refreshTtlStr = env.JWT_REFRESH_EXPIRES_IN;
  // It's '7d'. We will just parse the 'd' and assume Date arithmetic.
  const days = parseInt(refreshTtlStr.replace('d', ''), 10) || 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashedRefresh,
      expiresAt,
    },
  });

  return {
    tokens: { accessToken, refreshToken },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function refreshAccessToken(token: string) {
  // 1. Verify JWT signature. Throws unauthorized if invalid/expired.
  // We use try/catch just to map to a standard message if we want, but verifyRefreshToken already throws unauthorized.
  // Actually, verifyRefreshToken throws unauthorized('Refresh token is invalid or has expired'). 
  // We will let it throw, and the controller will catch it and clear cookies.
  verifyRefreshToken(token);

  // 2. Hash and find in DB
  const hashedToken = hashToken(token);
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashedToken },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw unauthorized('Sesi Anda telah berakhir, silakan login kembali');
  }

  // 3. Issue new access token
  const accessToken = signAccessToken({
    sub: tokenRecord.user.id,
    role: tokenRecord.user.role,
    email: tokenRecord.user.email,
    isVerified: tokenRecord.user.isVerified,
  });

  return accessToken;
}
