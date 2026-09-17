import { Prisma } from '../../generated/prisma/client';
import { uploadImage } from '../../libs/cloudinary';
import { prisma } from '../../libs/prisma';
import { badRequest, forbidden } from '../../utils/app-error';
import { buildPaginationMeta, toPrismaPageArgs } from '../../utils/pagination';
import { CreateRoomInput, UpdateRoomInput } from './rooms.schema';

async function verifyPropertyOwnership(propertyId: string, tenantId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, tenantId, deletedAt: null },
  });
  if (!property) throw forbidden('Akses ditolak atau properti tidak ditemukan');
}

async function verifyRoomOwnership(roomId: string, tenantId: string) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, deletedAt: null },
    include: { property: true },
  });
  if (!room || room.property.tenantId !== tenantId)
    throw forbidden('Akses ditolak atau kamar tidak ditemukan');
}

async function fetchRoomsData(where: Prisma.RoomWhereInput, take: number, skip: number) {
  return Promise.all([
    prisma.room.findMany({
      where, take, skip,
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.room.count({ where }),
  ]);
}

export async function getRooms(tId: string, pId: string, page = 1, limit = 10) {
  await verifyPropertyOwnership(pId, tId);
  const { take, skip } = toPrismaPageArgs({ page, limit });
  const [data, total] = await fetchRoomsData({ propertyId: pId, deletedAt: null }, take, skip);
  return { data, meta: buildPaginationMeta(total, page, limit) };
}

async function uploadRoomImages(files: Express.Multer.File[]): Promise<string[]> {
  return Promise.all(files.map((f) => uploadImage(f, 'rooms')));
}

async function reorderMainImage(images: string[], mainIdx: number): Promise<string[]> {
  if (mainIdx >= images.length) return images;
  const main = images.splice(mainIdx, 1)[0];
  images.unshift(main);
  return images;
}

async function checkRoomNameExists(pId: string, name: string) {
  const exists = await prisma.room.findFirst({
    where: { propertyId: pId, name: { equals: name, mode: 'insensitive' }, deletedAt: null },
  });
  if (exists) throw badRequest('Nama kamar sudah ada');
}

export async function createRoom(tId: string, pId: string, d: CreateRoomInput, f: Express.Multer.File[]) {
  await verifyPropertyOwnership(pId, tId);
  await checkRoomNameExists(pId, d.name);

  let urls = await uploadRoomImages(f);
  if (d.mainImageIndex !== undefined) urls = await reorderMainImage(urls, d.mainImageIndex);

  return prisma.room.create({
    data: {
      name: d.name, description: d.description,
      basePrice: d.basePrice, capacity: d.capacity, totalUnits: d.totalUnits,
      propertyId: pId,
      images: { create: urls.map((url, i) => ({ url, sortOrder: i })) },
    },
  });
}

async function handleDeleteImages(
  tx: Prisma.TransactionClient,
  roomId: string,
  deletedStr?: string,
) {
  if (!deletedStr) return;
  try {
    const deletedIds: string[] = JSON.parse(deletedStr);
    if (Array.isArray(deletedIds) && deletedIds.length > 0)
      await tx.roomImage.deleteMany({ where: { id: { in: deletedIds }, roomId } });
  } catch {
    /* ignore */
  }
}

function prepareUploadData(urls: string[], roomId: string, mainIdx?: number) {
  const data = urls.map((url, i) => ({ url, sortOrder: i, roomId }));
  if (mainIdx !== undefined && data[mainIdx]) {
    const mainImg = data.splice(mainIdx, 1)[0];
    mainImg.sortOrder = 0;
    data.unshift(mainImg);
    for (let i = 1; i < data.length; i++) data[i].sortOrder = i;
  }
  return data;
}

async function handleNewImages(
  tx: Prisma.TransactionClient,
  roomId: string,
  files: Express.Multer.File[],
  mainIdx?: number,
) {
  if (!files || files.length === 0) return;
  const imageUrls = await uploadRoomImages(files);
  const uploadData = prepareUploadData(imageUrls, roomId, mainIdx);
  if (mainIdx !== undefined) {
    await tx.roomImage.updateMany({ where: { roomId }, data: { sortOrder: { increment: 1 } } });
  }
  await tx.roomImage.createMany({ data: uploadData });
}

async function handleSetMainImage(tx: Prisma.TransactionClient, roomId: string, mainId?: string) {
  if (!mainId) return;
  const allImages = await tx.roomImage.findMany({
    where: { roomId },
    orderBy: { sortOrder: 'asc' },
  });
  let currentOrder = 1;
  for (const img of allImages) {
    const order = img.id === mainId ? 0 : currentOrder++;
    if (img.sortOrder !== order)
      await tx.roomImage.update({ where: { id: img.id }, data: { sortOrder: order } });
  }
}

async function verifyRoomUpdate(tId: string, roomId: string, newName?: string) {
  const room = await prisma.room.findFirst({ where: { id: roomId, deletedAt: null } });
  if (!room) throw badRequest('Kamar tidak ditemukan');
  await verifyPropertyOwnership(room.propertyId, tId);
  if (newName && newName !== room.name) {
    const exists = await prisma.room.findFirst({
      where: { propertyId: room.propertyId, name: { equals: newName, mode: 'insensitive' }, deletedAt: null },
    });
    if (exists) throw badRequest('Nama kamar sudah ada');
  }
  return room;
}

function buildUpdateData(data: UpdateRoomInput) {
  return {
    ...(data.name && { name: data.name }),
    ...(data.description && { description: data.description }),
    ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
    ...(data.capacity !== undefined && { capacity: data.capacity }),
    ...(data.totalUnits !== undefined && { totalUnits: data.totalUnits }),
  };
}

export async function updateRoom(
  tId: string, roomId: string, data: UpdateRoomInput, files: Express.Multer.File[]
) {
  await verifyRoomUpdate(tId, roomId, data.name);
  return prisma.$transaction(async (tx) => {
    await handleDeleteImages(tx, roomId, data.deletedImages);
    await handleNewImages(tx, roomId, files, data.mainImageIndex);
    await handleSetMainImage(tx, roomId, data.mainImageId);
    return tx.room.update({ where: { id: roomId }, data: buildUpdateData(data) });
  });
}

export async function deleteRoom(tenantId: string, roomId: string) {
  await verifyRoomOwnership(roomId, tenantId);
  return prisma.room.update({ where: { id: roomId }, data: { deletedAt: new Date() } });
}
