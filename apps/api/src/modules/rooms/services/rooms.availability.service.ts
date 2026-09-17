import { prisma } from '../../../libs/prisma';
import { badRequest, notFound } from '../../../utils/app-error';
import { eachNight, toDateOnly } from '../../../utils/date';

type AvailData = { startDate: string; endDate: string; isAvailable: boolean; availableUnits?: number | null };

async function verifyAndGetDates(tenantId: string, roomId: string, data: AvailData) {
  const room = await prisma.room.findFirst({ where: { id: roomId, property: { tenantId }, deletedAt: null } });
  if (!room) throw notFound('Kamar tidak ditemukan');
  const start = toDateOnly(data.startDate);
  const end = toDateOnly(data.endDate);
  if (start > end) throw badRequest('Tanggal akhir harus setelah tanggal mulai');
  return eachNight(start, new Date(end.getTime() + 86400000));
}

export async function upsertAvailability(tenantId: string, roomId: string, data: AvailData) {
  const nights = await verifyAndGetDates(tenantId, roomId, data);
  for (const date of nights) {
    const payload = { isAvailable: data.isAvailable, availableUnits: data.availableUnits ?? null };
    await prisma.roomAvailability.upsert({
      where: { roomId_date: { roomId, date } }, update: payload, create: { roomId, date, ...payload },
    });
  }
  return { message: 'Ketersediaan kamar berhasil diperbarui' };
}
