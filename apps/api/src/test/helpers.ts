import supertest from 'supertest';
import { createApp } from '../app';
import { User } from '../generated/prisma/client';
import { issueTokens } from '../libs/jwt';
import { prisma } from '../libs/prisma';

/**
 * Returns a supertest agent bound to the Express app.
 * Does NOT start a server — supertest handles that internally.
 */
export function createTestApp() {
  return supertest(createApp());
}

/**
 * Truncates all relevant tables using Prisma model methods.
 * Order matters: children first, then parents.
 * Call this in `beforeEach` so every test starts with a clean DB.
 */
export async function truncateAll(): Promise<void> {
  const models = ['bookingNight', 'notification', 'reviewReply', 'review', 'booking', 'peakSeasonRate', 'roomAvailability', 'roomImage', 'room', 'propertyImage', 'property', 'propertyCategory', 'tenantProfile', 'verificationToken', 'refreshToken', 'user'] as const;
  for (const m of models) await (prisma[m] as unknown as { deleteMany: () => Promise<void> }).deleteMany();
}

/**
 * Helper to generate valid authentication cookies for a given user.
 */
export async function getAuthCookies(user: User): Promise<string[]> {
  const { accessToken, refreshToken } = issueTokens({
    sub: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    isVerified: user.isVerified,
  });

  return [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`];
}
