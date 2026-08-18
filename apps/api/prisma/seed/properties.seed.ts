import type { PrismaClient } from '../../src/generated/prisma/client';
import { dayjs, toDateOnly } from '../../src/utils/date';
import {
  CATEGORIES,
  PROPERTY_IMAGES,
  TENANT_ONE_PROPERTIES,
  TENANT_TWO_PROPERTIES,
  type PropertySeed,
} from './data';

const AVAILABILITY_DAYS = 90;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seedCategories(prisma: PrismaClient, tenantId: string) {
  const map = new Map<string, string>();
  for (const name of CATEGORIES) {
    const slug = slugify(name);
    const category = await prisma.propertyCategory.upsert({
      where: { tenantId_slug: { tenantId, slug } },
      update: {},
      create: { tenantId, name, slug },
    });
    map.set(name, category.id);
  }
  return map;
}

async function seedRooms(prisma: PrismaClient, propertyId: string, seed: PropertySeed) {
  const roomIds: string[] = [];
  for (const room of seed.rooms) {
    const existing = await prisma.room.findFirst({ where: { propertyId, name: room.name } });
    const record =
      existing ??
      (await prisma.room.create({
        data: {
          propertyId,
          name: room.name,
          description: room.description,
          basePrice: room.basePrice,
          capacity: room.capacity,
          totalUnits: room.totalUnits,
          imageUrl: PROPERTY_IMAGES[roomIds.length % PROPERTY_IMAGES.length] as string,
        },
      }));
    roomIds.push(record.id);
  }
  return roomIds;
}

/** Opens the next 90 days, then blocks a short maintenance window. */
async function seedAvailability(prisma: PrismaClient, roomId: string, offset: number) {
  const rows = Array.from({ length: AVAILABILITY_DAYS }, (_, index) => {
    const date = toDateOnly(dayjs().add(index, 'day').format('YYYY-MM-DD'));
    const isMaintenance = index >= 40 + offset && index < 43 + offset;
    return { roomId, date, isAvailable: !isMaintenance };
  });
  await prisma.roomAvailability.createMany({ data: rows, skipDuplicates: true });
}

/** One percentage window and one nominal window per room. */
async function seedPeakSeason(prisma: PrismaClient, roomId: string) {
  const existing = await prisma.peakSeasonRate.count({ where: { roomId } });
  if (existing > 0) return;

  await prisma.peakSeasonRate.createMany({
    data: [
      {
        roomId,
        name: 'Long Weekend',
        startDate: toDateOnly(dayjs().add(14, 'day').format('YYYY-MM-DD')),
        endDate: toDateOnly(dayjs().add(17, 'day').format('YYYY-MM-DD')),
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 25,
      },
      {
        roomId,
        name: 'Libur Nasional',
        startDate: toDateOnly(dayjs().add(30, 'day').format('YYYY-MM-DD')),
        endDate: toDateOnly(dayjs().add(33, 'day').format('YYYY-MM-DD')),
        adjustmentType: 'NOMINAL',
        adjustmentValue: 150000,
      },
    ],
  });
}

async function seedProperty(
  prisma: PrismaClient,
  tenantId: string,
  categories: Map<string, string>,
  seed: PropertySeed,
  index: number,
) {
  const property = await prisma.property.upsert({
    where: { slug: seed.slug },
    update: {},
    create: {
      tenantId,
      categoryId: categories.get(seed.category) as string,
      name: seed.name,
      slug: seed.slug,
      description: seed.description,
      city: seed.city,
      province: seed.province,
      address: seed.address,
      images: {
        create: PROPERTY_IMAGES.map((url, sortOrder) => ({ url, sortOrder })),
      },
    },
  });

  const roomIds = await seedRooms(prisma, property.id, seed);
  for (const roomId of roomIds) {
    await seedAvailability(prisma, roomId, index);
    await seedPeakSeason(prisma, roomId);
  }
  return roomIds;
}

export async function seedProperties(
  prisma: PrismaClient,
  tenantProfileIds: string[],
): Promise<string[]> {
  const groups = [TENANT_ONE_PROPERTIES, TENANT_TWO_PROPERTIES];
  const allRoomIds: string[] = [];

  for (const [groupIndex, tenantId] of tenantProfileIds.entries()) {
    const categories = await seedCategories(prisma, tenantId);
    const properties = groups[groupIndex] ?? [];
    for (const [index, seed] of properties.entries()) {
      const roomIds = await seedProperty(prisma, tenantId, categories, seed, index);
      allRoomIds.push(...roomIds);
    }
  }

  return allRoomIds;
}
