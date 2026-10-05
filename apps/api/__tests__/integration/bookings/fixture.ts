import type { User } from '../../../src/generated/prisma/client';
import { signAccessToken } from '../../../src/libs/jwt';
import { prisma } from '../../../src/libs/prisma';
import { toDateOnly } from '../../../src/utils/date';

export function bearer(user: User) {
  return signAccessToken({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: true,
  });
}

export async function seedPeople() {
  const guest = await makeUser('guest@test.com', 'Tamu', 'USER');
  const stranger = await makeUser('stranger@test.com', 'Orang Lain', 'USER');
  const owner = await makeTenant('owner@test.com', 'Pemilik', 'Rumah A');
  const other = await makeTenant('other@test.com', 'Pemilik Lain', 'Rumah B');
  const stay = await makeStay(owner.profileId, 'villa-a');
  const otherStay = await makeStay(other.profileId, 'villa-b');
  return { guest, stranger, owner, other, stay, otherStay };
}

async function makeUser(email: string, name: string, role: 'USER' | 'TENANT') {
  return prisma.user.create({
    data: { email, name, role, isVerified: true, passwordHash: 'hash' },
  });
}

async function makeTenant(email: string, name: string, companyName: string) {
  const user = await makeUser(email, name, 'TENANT');
  const profile = await prisma.tenantProfile.create({
    data: { userId: user.id, companyName },
  });
  return { user, profileId: profile.id };
}

async function makeStay(tenantId: string, slug: string) {
  const category = await prisma.propertyCategory.create({
    data: { tenantId, name: slug, slug },
  });
  const property = await prisma.property.create({
    data: {
      tenantId,
      categoryId: category.id,
      name: slug,
      slug,
      description: 'Untuk tes',
      address: 'Jalan Tes',
      city: 'Denpasar',
      province: 'Bali',
    },
  });
  const room = await prisma.room.create({
    data: {
      propertyId: property.id,
      name: 'Kamar',
      description: 'Kamar tes',
      basePrice: 500000,
      capacity: 2,
    },
  });
  return { propertyId: property.id, roomId: room.id };
}

type BookingInput = {
  orderNumber: string;
  userId: string;
  propertyId: string;
  roomId: string;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'PROCESSED' | 'COMPLETED';
  checkIn: string;
  checkOut: string;
  withProof?: boolean;
  withNight?: boolean;
  totalPrice?: number;
};

export async function seedBooking(input: BookingInput) {
  return prisma.booking.create({
    data: {
      orderNumber: input.orderNumber,
      userId: input.userId,
      propertyId: input.propertyId,
      roomId: input.roomId,
      checkIn: toDateOnly(input.checkIn),
      checkOut: toDateOnly(input.checkOut),
      guestCount: 1,
      totalPrice: input.totalPrice ?? 500000,
      status: input.status,
      paymentProofUrl: input.withProof ? 'https://example.com/proof.jpg' : null,
      paymentProofUploadedAt: input.withProof ? new Date() : null,
      nights: input.withNight ? { create: nightRow(input.checkIn, input.totalPrice ?? 500000) } : undefined,
    },
  });
}

function nightRow(checkIn: string, price: number) {
  return { date: toDateOnly(checkIn), basePrice: price, finalPrice: price };
}
