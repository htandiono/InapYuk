import type { PrismaClient } from '../../src/generated/prisma/client';
import type { BookingStatus } from '@inapyuk/types';
import { resolveRoomPricing } from '../../src/services/pricing.service';
import { addMinutes, dayjs, toDateOnly } from '../../src/utils/date';

interface BookingPlan {
  status: BookingStatus;
  checkInOffsetDays: number;
  nights: number;
  guestIndex: number;
  roomIndex: number;
  withReview?: boolean;
}

/** One booking per status so every list, filter and report has real data. */
const PLANS: BookingPlan[] = [
  { status: 'WAITING_PAYMENT', checkInOffsetDays: 10, nights: 2, guestIndex: 0, roomIndex: 0 },
  { status: 'WAITING_CONFIRMATION', checkInOffsetDays: 12, nights: 3, guestIndex: 1, roomIndex: 2 },
  { status: 'PROCESSED', checkInOffsetDays: 1, nights: 2, guestIndex: 2, roomIndex: 4 },
  { status: 'PROCESSED', checkInOffsetDays: 16, nights: 4, guestIndex: 0, roomIndex: 6 },
  { status: 'CANCELLED', checkInOffsetDays: 20, nights: 1, guestIndex: 3, roomIndex: 8 },
  {
    status: 'COMPLETED',
    checkInOffsetDays: -12,
    nights: 3,
    guestIndex: 1,
    roomIndex: 10,
    withReview: true,
  },
  { status: 'COMPLETED', checkInOffsetDays: -5, nights: 2, guestIndex: 2, roomIndex: 12 },
];

function buildOrderNumber(checkIn: Date, sequence: number): string {
  const stamp = dayjs(checkIn).format('YYYYMMDD');
  return `INP-${stamp}-${String(sequence + 1).padStart(4, '0')}`;
}

function paymentFields(plan: BookingPlan, createdAt: Date) {
  const deadline = addMinutes(createdAt, 60);
  if (plan.status === 'WAITING_PAYMENT') return { paymentDeadline: deadline };
  if (plan.status === 'CANCELLED') {
    return { paymentDeadline: deadline, cancelledAt: createdAt, cancelledBy: 'SYSTEM' as const };
  }
  const proof = {
    paymentDeadline: deadline,
    paymentProofUrl: 'https://placehold.co/600x800/png?text=Bukti+Transfer',
    paymentProofUploadedAt: createdAt,
  };
  if (plan.status === 'WAITING_CONFIRMATION') return proof;
  return { ...proof, confirmedAt: createdAt };
}

async function createBooking(prisma: PrismaClient, plan: BookingPlan, sequence: number, guestIds: string[], roomIds: string[]) {
  const roomId = roomIds[plan.roomIndex % roomIds.length] as string, userId = guestIds[plan.guestIndex % guestIds.length] as string;
  const checkIn = toDateOnly(dayjs().add(plan.checkInOffsetDays, 'day').format('YYYY-MM-DD')), checkOut = toDateOnly(dayjs(checkIn).add(plan.nights, 'day').format('YYYY-MM-DD'));
  const orderNumber = buildOrderNumber(checkIn, sequence);
  const existing = await prisma.booking.findUnique({ where: { orderNumber } });
  if (existing) return existing;
  const pricing = await resolveRoomPricing({ roomId, checkIn, checkOut }), createdAt = dayjs(checkIn).subtract(3, 'day').toDate();
  return prisma.booking.create({
    data: {
      orderNumber, userId, roomId, propertyId: pricing.propertyId, checkIn, checkOut,
      guestCount: Math.min(2, pricing.capacity), totalPrice: pricing.totalPrice, status: plan.status, createdAt, ...paymentFields(plan, createdAt),
      nights: { create: pricing.nights.map((night) => ({ date: night.date, basePrice: night.basePrice, finalPrice: night.finalPrice, peakSeasonRateName: night.peakSeasonRateName })) },
    },
  });
}

async function addReview(prisma: PrismaClient, bookingId: string, userId: string, propertyId: string) {
  const existing = await prisma.review.findUnique({ where: { bookingId } });
  if (existing) return;
  const review = await prisma.review.create({
    data: { bookingId, userId, propertyId, rating: 5, comment: 'Kamarnya bersih, responsif, mantap.' },
  });
  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { tenantId: true } });
  if (!property) return;
  await prisma.reviewReply.create({
    data: { reviewId: review.id, tenantId: property.tenantId, comment: 'Terima kasih banyak!' },
  });
}

export async function seedBookings(
  prisma: PrismaClient,
  guestIds: string[],
  roomIds: string[],
): Promise<number> {
  let created = 0;
  for (const [sequence, plan] of PLANS.entries()) {
    const booking = await createBooking(prisma, plan, sequence, guestIds, roomIds);
    created += 1;
    if (plan.withReview) {
      await addReview(prisma, booking.id, booking.userId, booking.propertyId);
    }
  }
  return created;
}
