import { prisma } from '../../../libs/prisma';
import { deleteImage } from '../../../libs/cloudinary';
import { CreatePropertyInput, UpdatePropertyInput } from '../properties.schema';
import { generateUniqueSlug } from './properties.helpers';
import {
  checkDuplicateName,
  executeUpdatePropertyQuery,
  extractDeletedImageIds,
  getValidPropertyForUpdate,
  logImageDeleteError,
  resolveGeocodeForUpdate,
  uploadPropertyImages,
  verifyCategoryOwnership,
} from './properties.mutations.helpers';

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

export async function createProperty(
  tenantId: string,
  data: CreatePropertyInput,
  files: Express.Multer.File[],
) {
  await checkDuplicateName(tenantId, data.name);
  await verifyCategoryOwnership(data.categoryId, tenantId);
  const slug = await generateUniqueSlug(data.name);
  const geo =
    data.latitude !== undefined && data.longitude !== undefined
      ? { lat: data.latitude, lng: data.longitude }
      : await resolveGeocodeForUpdate(
          { ...data, latitude: undefined, longitude: undefined },
          { address: data.address, city: data.city, province: data.state },
        );
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
  if (data.name && data.name.toLowerCase() !== property.name.toLowerCase())
    await checkDuplicateName(tenantId, data.name, propertyId);
  if (data.categoryId) await verifyCategoryOwnership(data.categoryId, tenantId);
  const geo = await resolveGeocodeForUpdate(data, property);
  const deletedIds = extractDeletedImageIds(data);
  const deletedImagesData = property.images.filter((img) => deletedIds.includes(img.id));
  const newImageUploads = await uploadPropertyImages(
    newFiles,
    property.images.length - deletedImagesData.length,
  );
  const updatedProperty = await executeUpdatePropertyQuery(
    propertyId,
    data,
    geo,
    deletedIds,
    newImageUploads,
  );
  if (deletedImagesData.length > 0)
    Promise.all(deletedImagesData.map((img) => deleteImage(img.url))).catch(logImageDeleteError);
  return updatedProperty;
}

export async function deleteProperty(tenantId: string, propertyId: string) {
  await getValidPropertyForUpdate(tenantId, propertyId);
  return prisma.property.update({ where: { id: propertyId }, data: { deletedAt: new Date() } });
}
