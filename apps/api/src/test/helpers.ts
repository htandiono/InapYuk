import supertest from 'supertest';
import { createApp } from '../app';
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
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
}
