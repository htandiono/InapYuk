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
 * Truncates all relevant tables using Prisma's deleteMany.
 * Ordered to respect foreign key constraints (children first).
 * Call this in `beforeEach` so every test starts with a clean DB.
 */
export async function truncateAll(): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }: { tablename: string }) => tablename)
    .filter((name: string) => name !== '_prisma_migrations')
    .map((name: string) => `"${name}"`)
    .join(', ');

  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.log({ error });
  }
}

/**
 * Helper to generate valid authentication cookies for a given user.
 */
export async function getAuthCookies(user: User): Promise<string[]> {
  const { accessToken, refreshToken } = issueTokens({
    sub: user.id,
    role: user.role,
    email: user.email,
    isVerified: user.isVerified,
  });

  return [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`];
}
