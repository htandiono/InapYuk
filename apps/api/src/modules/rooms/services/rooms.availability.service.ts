import { prisma } from '../../../libs/prisma';
import { badRequest, notFound } from '../../../utils/app-error';
import { eachNight, toDateOnly } from '../../../utils/date';

export async function upsertAvailability(
  tenantId: string,
  roomId: string,
  data: {
    startDate: string;
    endDate: string;
    isAvailable: boolean;
    availableUnits?: number | null;
  }
) {
  const room = await prisma.room.findFirst({
    where: { id: roomId, property: { tenantId }, deletedAt: null },
  });
  if (!room) throw notFound('Kamar tidak ditemukan');

  const start = toDateOnly(data.startDate);
  const end = toDateOnly(data.endDate);

  if (start > end) {
    throw badRequest('Tanggal akhir harus setelah tanggal mulai');
  }

  // Generate all dates from start to end inclusive
  const nights = eachNight(start, new Date(end.getTime() + 86400000));

  await prisma.$transaction(
    nights.map((date) =>
      prisma.roomAvailability.upsert({
        where: {
          roomId_date: { roomId, date },
        },
        update: {
          isAvailable: data.isAvailable,
          availableUnits: data.availableUnits ?? null,
        },
        create: {
          roomId,
          date,
          isAvailable: data.isAvailable,
          availableUnits: data.availableUnits ?? null,
        },
      })
    )
  );

  return { message: 'Ketersediaan kamar berhasil diperbarui' };
}
