import type { PrismaClient } from '../../src/generated/prisma/client';
import { hashPassword } from '../../src/libs/password';
import { GUESTS, SEED_PASSWORD, TENANTS } from './data';

export interface SeededUsers {
  tenantProfileIds: string[];
  guestIds: string[];
}

/**
 * Every seeded account is already verified so Feature 2 can build and demo the
 * booking flow before Feature 1's registration and verification screens land.
 */
export async function seedUsers(prisma: PrismaClient): Promise<SeededUsers> {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  const tenantProfileIds: string[] = [];
  for (const tenant of TENANTS) {
    const user = await prisma.user.upsert({
      where: { email: tenant.email },
      update: {},
      create: {
        email: tenant.email,
        name: tenant.name,
        passwordHash,
        role: 'TENANT',
        isVerified: true,
      },
    });

    const profile = await prisma.tenantProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        companyName: tenant.companyName,
        companyAddress: tenant.companyAddress,
        bankName: 'Bank Central Asia',
        bankAccount: '1234567890',
      },
    });
    tenantProfileIds.push(profile.id);
  }

  const guestIds: string[] = [];
  for (const guest of GUESTS) {
    const user = await prisma.user.upsert({
      where: { email: guest.email },
      update: {},
      create: {
        email: guest.email,
        name: guest.name,
        phone: guest.phone,
        passwordHash,
        role: 'USER',
        isVerified: true,
      },
    });
    guestIds.push(user.id);
  }

  return { tenantProfileIds, guestIds };
}
