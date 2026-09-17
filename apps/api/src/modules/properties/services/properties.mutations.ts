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
  tenantId: string, data: CreatePropertyInput, slug: string,
  geo: { lat: number; lng: number } | null | undefined, imageUploads: { url: string; sortOrder: number }[],
) {
  return prisma.property.create({
    data: {
      tenantId, categoryId: data.categoryId, name: data.name, slug,
      description: data.description, address: data.address,
      city: data.city, province: data.state,
      latitude: geo?.lat, longitude: geo?.lng,
      images: { create: imageUploads },
    },
    include: { images: true },
  });
}

async function getGeoForCreate(d: CreatePropertyInput) {
  if (d.latitude !== undefined && d.longitude !== undefined)
    return { lat: d.latitude, lng: d.longitude };
  return resolveGeocodeForUpdate(
    { ...d, latitude: undefined, longitude: undefined },
    { address: d.address, city: d.city, province: d.state }
  );
}

function handleMainImageForCreate(uploads: { url: string; sortOrder: number }[], idx?: number) {
  if (idx !== undefined && uploads[idx]) {
    const mainImg = uploads.splice(idx, 1)[0];
    uploads.unshift(mainImg);
    uploads.forEach((img, i) => { img.sortOrder = i; });
  }
}

export async function createProperty(tId: string, d: CreatePropertyInput, f: Express.Multer.File[]) {
  await checkDuplicateName(tId, d.name);
  await verifyCategoryOwnership(d.categoryId, tId);
  const [slug, geo, uploads] = await Promise.all([
    generateUniqueSlug(d.name),
    getGeoForCreate(d),
    uploadPropertyImages(f),
  ]);
  handleMainImageForCreate(uploads, d.mainImageIndex);
  return executeCreatePropertyQuery(tId, d, slug, geo, uploads);
}

async function validateUpdate(tId: string, pId: string, d: UpdatePropertyInput, p: { name: string }) {
  if (d.name && d.name.toLowerCase() !== p.name.toLowerCase())
    await checkDuplicateName(tId, d.name, pId);
  if (d.categoryId) await verifyCategoryOwnership(d.categoryId, tId);
}

async function handlePropertyImages(p: { images: { id: string; url: string }[] }, dIds: string[], f: Express.Multer.File[]) {
  const deletedImgs = p.images.filter((img) => dIds.includes(img.id));
  const newUploads = await uploadPropertyImages(f, p.images.length - deletedImgs.length);
  if (deletedImgs.length > 0)
    Promise.all(deletedImgs.map((img) => deleteImage(img.url))).catch(logImageDeleteError);
  return newUploads;
}

export async function updateProperty(tId: string, pId: string, d: UpdatePropertyInput, f: Express.Multer.File[]) {
  const prop = await getValidPropertyForUpdate(tId, pId);
  await validateUpdate(tId, pId, d, prop);
  const geo = await resolveGeocodeForUpdate(d, prop);
  const dIds = extractDeletedImageIds(d);
  const newUploads = await handlePropertyImages(prop, dIds, f);
  return executeUpdatePropertyQuery(pId, d, geo, dIds, newUploads);
}

export async function deleteProperty(tenantId: string, propertyId: string) {
  await getValidPropertyForUpdate(tenantId, propertyId);
  return prisma.property.update({ where: { id: propertyId }, data: { deletedAt: new Date() } });
}
