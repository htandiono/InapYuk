import { prisma } from '../../../libs/prisma';
import { badRequest, forbidden, notFound } from '../../../utils/app-error';
import { toDateOnly } from '../../../utils/date';
import { Prisma } from '../../../generated/prisma/client';

export async function getPeakSeasons(tenantId: string, roomId: string) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, property: { tenantId }, deletedAt: null },
  });
  if (!room) throw notFound('Kamar tidak ditemukan');

  return prisma.peakSeasonRate.findMany({
    where: { roomId },
    orderBy: { startDate: 'desc' },
  });
}

export async function createPeakSeason(
  tenantId: string,
  roomId: string,
  data: {
    name: string;
    startDate: string;
    endDate: string;
    adjustmentType: 'NOMINAL' | 'PERCENTAGE';
    adjustmentValue: number;
  },
) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, property: { tenantId }, deletedAt: null },
  });
  if (!room) throw notFound('Kamar tidak ditemukan');

  const startDate = toDateOnly(data.startDate);
  const endDate = toDateOnly(data.endDate);

  if (startDate > endDate) {
    throw badRequest('Tanggal akhir harus setelah atau sama dengan tanggal mulai');
  }

  // Check for exact overlap (UI will warn but we allow overlapping in general; last created wins)
  // But we can just create it.
  return prisma.peakSeasonRate.create({
    data: {
      roomId,
      name: data.name,
      startDate,
      endDate,
      adjustmentType: data.adjustmentType,
      adjustmentValue: new Prisma.Decimal(data.adjustmentValue),
    },
  });
}

export async function updatePeakSeason(
  tenantId: string,
  rateId: string,
  data: {
    name?: string;
    startDate?: string;
    endDate?: string;
    adjustmentType?: 'NOMINAL' | 'PERCENTAGE';
    adjustmentValue?: number;
  },
) {
  const rate = await prisma.peakSeasonRate.findUnique({
    where: { id: rateId },
    include: { room: { include: { property: true } } },
  });
  if (!rate) throw notFound('Harga musiman tidak ditemukan');
  if (rate.room.property.tenantId !== tenantId) throw forbidden('Akses ditolak');

  let startDate = rate.startDate;
  let endDate = rate.endDate;

  if (data.startDate) startDate = toDateOnly(data.startDate);
  if (data.endDate) endDate = toDateOnly(data.endDate);

  if (startDate > endDate) {
    throw badRequest('Tanggal akhir harus setelah atau sama dengan tanggal mulai');
  }

  return prisma.peakSeasonRate.update({
    where: { id: rateId },
    data: {
      name: data.name,
      startDate: data.startDate ? toDateOnly(data.startDate) : undefined,
      endDate: data.endDate ? toDateOnly(data.endDate) : undefined,
      adjustmentType: data.adjustmentType,
      adjustmentValue: data.adjustmentValue ? new Prisma.Decimal(data.adjustmentValue) : undefined,
    },
  });
}

export async function deletePeakSeason(tenantId: string, rateId: string) {
  const rate = await prisma.peakSeasonRate.findUnique({
    where: { id: rateId },
    include: { room: { include: { property: true } } },
  });
  if (!rate) throw notFound('Harga musiman tidak ditemukan');
  if (rate.room.property.tenantId !== tenantId) throw forbidden('Akses ditolak');

  await prisma.peakSeasonRate.delete({
    where: { id: rateId },
  });

  return { message: 'Harga musiman berhasil dihapus' };
}
