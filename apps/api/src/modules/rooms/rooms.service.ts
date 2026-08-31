import { Prisma } from '../../generated/prisma/client';
import { uploadImage } from '../../libs/cloudinary';
import { prisma } from '../../libs/prisma';
import { badRequest, forbidden } from '../../utils/app-error';
import { buildPaginationMeta, toPrismaPageArgs } from '../../utils/pagination';
import { CreateRoomInput, UpdateRoomInput } from './rooms.schema';

async function verifyPropertyOwnership(propertyId: string, tenantId: string) {
  const property = await prisma.property.findFirst({ where: { id: propertyId, tenantId, deletedAt: null } });
  if (!property) throw forbidden('Akses ditolak atau properti tidak ditemukan');
}

async function verifyRoomOwnership(roomId: string, tenantId: string) {
  const room = await prisma.room.findFirst({ where: { id: roomId, deletedAt: null }, include: { property: true } });
  if (!room || room.property.tenantId !== tenantId) throw forbidden('Akses ditolak atau kamar tidak ditemukan');
}

export async function getRooms(tenantId: string, propertyId: string, page: number = 1, limit: number = 10) {
  await verifyPropertyOwnership(propertyId, tenantId);
  const { take, skip } = toPrismaPageArgs({ page, limit });
  const where = { propertyId, deletedAt: null };
  const [data, total] = await Promise.all([
    prisma.room.findMany({ where, take, skip, orderBy: { createdAt: 'desc' }, include: { images: { orderBy: { sortOrder: 'asc' } } } }),
    prisma.room.count({ where }),
  ]);
  return { data, meta: buildPaginationMeta(total, page, limit) };
}

export async function createRoom(tId: string, pId: string, d: CreateRoomInput, f: Express.Multer.File[]) {
  await verifyPropertyOwnership(pId, tId);
  if (await prisma.room.findFirst({ where: { propertyId: pId, name: { equals: d.name, mode: 'insensitive' }, deletedAt: null } })) throw badRequest('Ada');
  const urls = await Promise.all(f.map((f) => uploadImage(f, 'rooms')));
  if (d.mainImageIndex !== undefined && urls[d.mainImageIndex]) {
    const main = urls.splice(d.mainImageIndex, 1)[0];
    urls.unshift(main);
  }
  return prisma.room.create({
    data: {
      name: d.name, description: d.description, basePrice: d.basePrice, capacity: d.capacity, totalUnits: d.totalUnits, propertyId: pId,
      images: { create: urls.map((url, i) => ({ url, sortOrder: i })) },
    },
  });
}

export async function updateRoom(tenantId: string, roomId: string, data: UpdateRoomInput, files: Express.Multer.File[]) {
  const room = await prisma.room.findFirst({ where: { id: roomId, deletedAt: null } });
  if (!room) throw badRequest('Not found');
  await verifyPropertyOwnership(room.propertyId, tenantId);
  if (data.name && data.name !== room.name && await prisma.room.findFirst({ where: { propertyId: room.propertyId, name: { equals: data.name, mode: 'insensitive' }, deletedAt: null } })) throw badRequest('Name taken');
  return prisma.$transaction(async (tx) => {
    await handleDeleteImages(tx, roomId, data.deletedImages);
    await handleNewImages(tx, roomId, files, data.mainImageIndex);
    await handleSetMainImage(tx, roomId, data.mainImageId);
    return tx.room.update({
      where: { id: roomId },
      data: { ...(data.name && { name: data.name }), ...(data.description && { description: data.description }), ...(data.basePrice !== undefined && { basePrice: data.basePrice }), ...(data.capacity !== undefined && { capacity: data.capacity }), ...(data.totalUnits !== undefined && { totalUnits: data.totalUnits }) },
    });
  });
}

async function handleDeleteImages(tx: Prisma.TransactionClient, roomId: string, deletedStr?: string) {
  if (!deletedStr) return;
  try {
    const deletedIds: string[] = JSON.parse(deletedStr);
    if (Array.isArray(deletedIds) && deletedIds.length > 0) await tx.roomImage.deleteMany({ where: { id: { in: deletedIds }, roomId } });
  } catch { /* ignore */ }
}

async function handleNewImages(tx: Prisma.TransactionClient, roomId: string, files: Express.Multer.File[], mainIdx?: number) {
  if (!files || files.length === 0) return;
  const imageUrls = await Promise.all(files.map((f) => uploadImage(f, 'rooms')));
  const uploadData = imageUrls.map((url, i) => ({ url, sortOrder: i, roomId }));
  if (mainIdx !== undefined && uploadData[mainIdx]) {
    await tx.roomImage.updateMany({ where: { roomId }, data: { sortOrder: { increment: 1 } } });
    const mainImg = uploadData[mainIdx];
    uploadData.splice(mainIdx, 1);
    mainImg.sortOrder = 0;
    uploadData.unshift(mainImg);
    for (let i = 1; i < uploadData.length; i++) uploadData[i].sortOrder++;
  }
  await tx.roomImage.createMany({ data: uploadData });
}

async function handleSetMainImage(tx: Prisma.TransactionClient, roomId: string, mainId?: string) {
  if (!mainId) return;
  const allImages = await tx.roomImage.findMany({ where: { roomId }, orderBy: { sortOrder: 'asc' } });
  let currentOrder = 1;
  for (const img of allImages) {
    const order = img.id === mainId ? 0 : currentOrder++;
    if (img.sortOrder !== order) await tx.roomImage.update({ where: { id: img.id }, data: { sortOrder: order } });
  }
}

export async function deleteRoom(tenantId: string, roomId: string) {
  await verifyRoomOwnership(roomId, tenantId);
  return prisma.room.update({ where: { id: roomId }, data: { deletedAt: new Date() } });
}
