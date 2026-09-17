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

async function verifyRoomOwnership(tenantId: string, roomId: string) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, property: { tenantId }, deletedAt: null },
  });
  if (!room) throw notFound('Kamar tidak ditemukan');
}

async function verifyRateOwnership(rateId: string, tenantId: string) {
  const rate = await prisma.peakSeasonRate.findUnique({
    where: { id: rateId },
    include: { room: { include: { property: true } } },
  });
  if (!rate) throw notFound('Harga musiman tidak ditemukan');
  if (rate.room.property.tenantId !== tenantId) throw forbidden('Akses ditolak');
  return rate;
}

type PeakData = { name: string; startDate: string; endDate: string; adjustmentType: 'NOMINAL' | 'PERCENTAGE'; adjustmentValue: number; };

export async function createPeakSeason(tenantId: string, roomId: string, data: PeakData) {
  await verifyRoomOwnership(tenantId, roomId);
  const startDate = toDateOnly(data.startDate), endDate = toDateOnly(data.endDate);
  if (startDate > endDate) throw badRequest('Tanggal akhir harus setelah atau sama dengan tanggal mulai');
  return prisma.peakSeasonRate.create({
    data: { roomId, name: data.name, startDate, endDate, adjustmentType: data.adjustmentType, adjustmentValue: new Prisma.Decimal(data.adjustmentValue) },
  });
}

export async function updatePeakSeason(tenantId: string, rateId: string, data: Partial<PeakData>) {
  const rate = await verifyRateOwnership(rateId, tenantId);
  const startDate = data.startDate ? toDateOnly(data.startDate) : rate.startDate;
  const endDate = data.endDate ? toDateOnly(data.endDate) : rate.endDate;
  if (startDate > endDate) throw badRequest('Tanggal akhir harus setelah atau sama dengan tanggal mulai');
  return prisma.peakSeasonRate.update({
    where: { id: rateId },
    data: {
      name: data.name, startDate: data.startDate ? toDateOnly(data.startDate) : undefined,
      endDate: data.endDate ? toDateOnly(data.endDate) : undefined, adjustmentType: data.adjustmentType,
      adjustmentValue: data.adjustmentValue ? new Prisma.Decimal(data.adjustmentValue) : undefined,
    },
  });
}

export async function deletePeakSeason(tenantId: string, rateId: string) {
  await verifyRateOwnership(rateId, tenantId);
  await prisma.peakSeasonRate.delete({ where: { id: rateId } });
  return { message: 'Harga musiman berhasil dihapus' };
}
