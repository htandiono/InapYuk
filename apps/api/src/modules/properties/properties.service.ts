import { prisma } from '../../libs/prisma';

export interface CityResult {
  city: string;
  province: string;
}

export async function getUniqueCities(): Promise<CityResult[]> {
  const properties = await prisma.property.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      city: true,
      province: true,
    },
    distinct: ['city', 'province'],
    orderBy: {
      city: 'asc',
    },
  });

  return properties;
}
