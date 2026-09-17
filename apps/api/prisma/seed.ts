import { prisma } from '../src/libs/prisma';
import { seedUsers } from './seed/users.seed';
import { seedProperties } from './seed/properties.seed';
import { seedBookings } from './seed/bookings.seed';
import { GUESTS, SEED_PASSWORD, TENANTS } from './seed/data';

/**
 * Idempotent: every step upserts, so `npm run db:seed` can be re-run safely.
 *
 * This dataset is the reason the two features can be built in parallel -
 * verified accounts, properties, rooms, availability, peak season rates and
 * bookings in every status all exist before either feature is written.
 */
async function main(): Promise<void> {
  console.log('Seeding users and tenants...');
  const { tenantProfileIds, guestIds } = await seedUsers(prisma);
  console.log('Seeding categories, properties, rooms, availability and peak season rates...');
  const roomIds = await seedProperties(prisma, tenantProfileIds);
  console.log('Seeding bookings, reviews and replies...');
  const bookingCount = await seedBookings(prisma, guestIds, roomIds);

  console.log('\nSeed complete');
  console.log(`  tenants: ${tenantProfileIds.length}\n  guests: ${guestIds.length}\n  rooms: ${roomIds.length}\n  bookings: ${bookingCount}`);
  console.log(`\n  Password: ${SEED_PASSWORD}\n  Tenant login: ${TENANTS[0]?.email}\n  Guest login: ${GUESTS[0]?.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
