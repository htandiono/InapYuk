import { prisma } from '../../../libs/prisma';
import { deleteImage } from '../../../libs/cloudinary';
import { geocodeAddress } from '../../../libs/opencage';
import { forbidden, notFound, badRequest } from '../../../utils/app-error';
import { CreatePropertyInput, UpdatePropertyInput } from '../properties.schema';
import { generateUniqueSlug, uploadPropertyImages } from './properties.helpers';

async function verifyCategoryOwnership(categoryId: string, tenantId: string) {
  const category = await prisma.propertyCategory.findFirst({
    where: { id: categoryId, tenantId, deletedAt: null },
  });
  if (!category) throw forbidden('Kategori tidak valid atau bukan milik Anda');
}

async function getValidPropertyForUpdate(tenantId: string, propertyId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, tenantId, deletedAt: null },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!property) throw notFound('Properti tidak ditemukan');
  return property;
}

async function resolveGeocodeForUpdate(
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

function extractDeletedImageIds(data: UpdatePropertyInput): string[] {
  if (!data.deletedImages) return [];
  try {
    return JSON.parse(data.deletedImages);
  } catch {
    return [];
  }
}

async function executeCreatePropertyQuery(
  tenantId: string,
  data: CreatePropertyInput,
  slug: string,
  geo: { lat: number; lng: number } | null | undefined,
  imageUploads: { url: string; sortOrder: number }[],
) {
  return prisma.property.create({
    data: {
      tenantId,
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description,
      address: data.address,
      city: data.city,
      province: data.state,
      latitude: geo?.lat,
      longitude: geo?.lng,
      images: { create: imageUploads },
    },
    include: { images: true },
  });
}

function buildUpdateData(
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

async function executeUpdatePropertyQuery(
  propertyId: string,
  data: UpdatePropertyInput,
  geo: { lat: number; lng: number } | null | undefined,
  deletedIds: string[],
  newUploads: { url: string; sortOrder: number }[],
) {
  return prisma.$transaction(async (tx) => {
    if (deletedIds.length > 0) {
      await tx.propertyImage.deleteMany({ where: { id: { in: deletedIds }, propertyId } });
    }
    if (data.mainImageIndex !== undefined && newUploads[data.mainImageIndex]) {
      await tx.propertyImage.updateMany({
        where: { propertyId },
        data: { sortOrder: { increment: 1 } },
      });
      const mainImg = newUploads[data.mainImageIndex];
      newUploads.splice(data.mainImageIndex, 1);
      mainImg.sortOrder = 0;
      newUploads.unshift(mainImg);
      for (let i = 1; i < newUploads.length; i++) {
        newUploads[i].sortOrder++;
      }
    }
    if (newUploads.length > 0) {
      await tx.propertyImage.createMany({ data: newUploads.map((i) => ({ ...i, propertyId })) });
    }
    if (data.mainImageId) {
      // Re-order images: main image gets 0, others get incremented
      const allImages = await tx.propertyImage.findMany({
        where: { propertyId },
        orderBy: { sortOrder: 'asc' },
      });
      let currentOrder = 1;
      for (const img of allImages) {
        const order = img.id === data.mainImageId ? 0 : currentOrder++;
        if (img.sortOrder !== order) {
          await tx.propertyImage.update({ where: { id: img.id }, data: { sortOrder: order } });
        }
      }
    }
    return tx.property.update({
      where: { id: propertyId },
      data: buildUpdateData(data, geo),
      include: { images: true },
    });
  });
}

export async function createProperty(
  tenantId: string,
  data: CreatePropertyInput,
  files: Express.Multer.File[],
) {
  const existingProp = await prisma.property.findFirst({
    where: { tenantId, name: { equals: data.name, mode: 'insensitive' }, deletedAt: null },
  });
  if (existingProp) throw badRequest('Anda sudah memiliki properti dengan nama ini');

  await verifyCategoryOwnership(data.categoryId, tenantId);
  const slug = await generateUniqueSlug(data.name);
  const geo =
    data.latitude !== undefined && data.longitude !== undefined
      ? { lat: data.latitude, lng: data.longitude }
      : await geocodeAddress(data.address, data.city, data.state, 'Indonesia');
  const imageUploads = await uploadPropertyImages(files);
  if (data.mainImageIndex !== undefined && imageUploads[data.mainImageIndex]) {
    const mainImg = imageUploads[data.mainImageIndex];
    imageUploads.splice(data.mainImageIndex, 1);
    imageUploads.unshift(mainImg);
    imageUploads.forEach((img, i) => {
      img.sortOrder = i;
    });
  }
  return executeCreatePropertyQuery(tenantId, data, slug, geo, imageUploads);
}

export async function updateProperty(
  tenantId: string,
  propertyId: string,
  data: UpdatePropertyInput,
  newFiles: Express.Multer.File[],
) {
  const property = await getValidPropertyForUpdate(tenantId, propertyId);

  if (data.name && data.name.toLowerCase() !== property.name.toLowerCase()) {
    const existingProp = await prisma.property.findFirst({
      where: {
        tenantId,
        name: { equals: data.name, mode: 'insensitive' },
        deletedAt: null,
        id: { not: propertyId },
      },
    });
    if (existingProp) throw badRequest('Anda sudah memiliki properti dengan nama ini');
  }

  if (data.categoryId) await verifyCategoryOwnership(data.categoryId, tenantId);
  const geo = await resolveGeocodeForUpdate(data, property);

  const deletedIds = extractDeletedImageIds(data);
  const deletedImagesData = property.images.filter((img) => deletedIds.includes(img.id));
  const remainingCount = property.images.length - deletedImagesData.length;
  const newImageUploads = await uploadPropertyImages(newFiles, remainingCount);

  const updatedProperty = await executeUpdatePropertyQuery(
    propertyId,
    data,
    geo,
    deletedIds,
    newImageUploads,
  );

  if (deletedImagesData.length > 0) {
    Promise.all(deletedImagesData.map((img) => deleteImage(img.url))).catch(console.error);
  }
  return updatedProperty;
}

export async function deleteProperty(tenantId: string, propertyId: string) {
  await getValidPropertyForUpdate(tenantId, propertyId);
  return prisma.property.update({
    where: { id: propertyId },
    data: { deletedAt: new Date() },
  });
}
