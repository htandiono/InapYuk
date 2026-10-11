import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { geocodePlace, type Place } from './backfill/geocode';

/**
 * Fills latitude/longitude for properties that have none, so the customer
 * detail page can show the map. Safe to re-run: it only ever touches rows
 * where a coordinate is NULL and never overwrites an existing one.
 *
 *   npm run db:backfill-geo                  dry run against the DB in .env
 *   npm run db:backfill-geo -- --apply       write the coordinates
 *   DATABASE_URL="<url>" npm run db:backfill-geo -- --apply     another database
 */
function describeTarget(url: string): string {
  const { hostname, pathname } = new URL(url);
  return `${hostname}${pathname}`;
}

function createClient(url: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

function findMissing(prisma: PrismaClient): Promise<Place[]> {
  return prisma.property.findMany({
    where: { deletedAt: null, OR: [{ latitude: null }, { longitude: null }] },
    select: { id: true, name: true, address: true, city: true, province: true },
    orderBy: { name: 'asc' },
  });
}

async function backfillOne(prisma: PrismaClient, place: Place, apply: boolean) {
  const match = await geocodePlace(place);
  if (!match) return console.log(`  SKIP  ${place.name}: no result, set it from the edit form`);
  const { lat, lng } = match.point;
  console.log(`  ${apply ? 'SET ' : 'WOULD'} ${place.name}: ${lat}, ${lng} (${match.source})`);
  if (!apply) return;
  const data = { latitude: lat, longitude: lng };
  await prisma.property.updateMany({ where: { id: place.id, latitude: null }, data });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const apply = process.argv.includes('--apply');
  console.log(`Database: ${describeTarget(url)}\nMode: ${apply ? 'APPLY' : 'DRY RUN'}`);
  const prisma = createClient(url);
  const places = await findMissing(prisma);
  console.log(`${places.length} propert(ies) without coordinates`);
  for (const place of places) await backfillOne(prisma, place, apply);
  await prisma.$disconnect();
  if (!apply && places.length > 0) console.log('\nDry run only. Add --apply to write.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
