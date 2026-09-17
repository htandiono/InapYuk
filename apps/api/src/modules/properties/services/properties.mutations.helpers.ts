import type { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../../libs/prisma';
import { uploadImage } from '../../../libs/cloudinary';
import { geocodeAddress } from '../../../libs/opencage';
import { forbidden, notFound, badRequest } from '../../../utils/app-error';
import { logger } from '../../../libs/logger';
import { UpdatePropertyInput } from '../properties.schema';

// ── Mutation helpers ─────────────────────────────────────────────────────────

export async function verifyCategoryOwnership(categoryId: string, tenantId: string) {
  const category = await prisma.propertyCategory.findFirst({
    where: { id: categoryId, tenantId, deletedAt: null },
  });
  if (!category) throw forbidden('Kategori tidak valid atau bukan milik Anda');
}

export async function getValidPropertyForUpdate(tenantId: string, propertyId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, tenantId, deletedAt: null },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!property) throw notFound('Properti tidak ditemukan');
  return property;
}

export async function checkDuplicateName(tenantId: string, name: string, excludeId?: string) {
  const existingProp = await prisma.property.findFirst({
    where: {
      tenantId,
      name: { equals: name, mode: 'insensitive' },
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  if (existingProp) throw badRequest('Anda sudah memiliki properti dengan nama ini');
}

export async function resolveGeocodeForUpdate(
  data: UpdatePropertyInput,
  property: { address: string; city: string; province: string },
) {
  if (data.latitude !== undefined && data.longitude !== undefined) {
    return { lat: data.latitude, lng: data.longitude };
  }
  if (!data.address && !data.city && !data.state) return undefined;
  return geocodeAddress(
    data.address || property.address,
    data.city || property.city,
    data.state || property.province,
    'Indonesia',
  );
}

export function extractDeletedImageIds(data: UpdatePropertyInput): string[] {
  if (!data.deletedImages) return [];
  try {
    return JSON.parse(data.deletedImages);
  } catch {
    return [];
  }
}

export function buildUpdateData(
  data: UpdatePropertyInput,
  geo: { lat: number; lng: number } | null | undefined,
) {
  return {
    ...(data.categoryId && { categoryId: data.categoryId }),
    ...(data.name && { name: data.name }),
    ...(data.description && { description: data.description }),
    ...(data.address && { address: data.address }),
    ...(data.city && { city: data.city }),
    ...(data.state && { province: data.state }),
    ...(geo && { latitude: geo.lat, longitude: geo.lng }),
  };
}

async function handleDeleteImages(
  tx: Prisma.TransactionClient,
  propertyId: string,
  deletedIds: string[],
) {
  if (deletedIds.length > 0)
    await tx.propertyImage.deleteMany({ where: { id: { in: deletedIds }, propertyId } });
}

function reorderNewUploadsMain(newUploads: { url: string; sortOrder: number }[], mainIdx: number) {
  const mainImg = newUploads.splice(mainIdx, 1)[0];
  mainImg.sortOrder = 0;
  newUploads.unshift(mainImg);
  for (let i = 1; i < newUploads.length; i++) newUploads[i].sortOrder++;
}

async function handleMainImageIndexForNewUploads(
  tx: Prisma.TransactionClient, propertyId: string,
  data: UpdatePropertyInput, newUploads: { url: string; sortOrder: number }[],
) {
  if (data.mainImageIndex !== undefined && newUploads[data.mainImageIndex]) {
    await tx.propertyImage.updateMany({ where: { propertyId }, data: { sortOrder: { increment: 1 } } });
    reorderNewUploadsMain(newUploads, data.mainImageIndex);
  }
}

async function handleNewUploadsCreation(
  tx: Prisma.TransactionClient,
  propertyId: string,
  newUploads: { url: string; sortOrder: number }[],
) {
  if (newUploads.length > 0)
    await tx.propertyImage.createMany({ data: newUploads.map((i) => ({ ...i, propertyId })) });
}

async function handleExistingMainImageReorder(
  tx: Prisma.TransactionClient, propertyId: string, mainImageId: string
) {
  const imgs = await tx.propertyImage.findMany({ where: { propertyId }, orderBy: { sortOrder: 'asc' } });
  let order = 1;
  for (const img of imgs) {
    const newOrder = img.id === mainImageId ? 0 : order++;
    if (img.sortOrder !== newOrder)
      await tx.propertyImage.update({ where: { id: img.id }, data: { sortOrder: newOrder } });
  }
}

export async function executeUpdatePropertyQuery(
  pId: string, data: UpdatePropertyInput, geo: { lat: number; lng: number } | null | undefined,
  deletedIds: string[], newUploads: { url: string; sortOrder: number }[]
) {
  return prisma.$transaction(async (tx) => {
    await handleDeleteImages(tx, pId, deletedIds);
    await handleMainImageIndexForNewUploads(tx, pId, data, newUploads);
    await handleNewUploadsCreation(tx, pId, newUploads);
    if (data.mainImageId) await handleExistingMainImageReorder(tx, pId, data.mainImageId);
    return tx.property.update({ where: { id: pId }, data: buildUpdateData(data, geo), include: { images: true } });
  });
}

export function logImageDeleteError(err: unknown) {
  logger.error('[ImageDeleteError]', err);
}

export async function uploadPropertyImages(files: Express.Multer.File[], startIndex: number = 0) {
  return Promise.all(
    files.map(async (file, index) => {
      const url = await uploadImage(file, 'properties');
      return { url, sortOrder: startIndex + index + 1 };
    }),
  );
}
