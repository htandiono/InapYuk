import type { BookingDetailDto, CreateBookingRequest, JwtPayload } from '@inapyuk/types';
import { Prisma } from '../../generated/prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../libs/prisma';
import {
  resolveRoomPricing,
  type NightlyRate,
  type RoomPricing,
} from '../../services/pricing.service';
import { addMinutes, toDateOnly } from '../../utils/date';
import { badRequest, conflict } from '../../utils/app-error';
import { assertStillAvailable } from './bookings.availability';
import type { BookingDb } from './bookings.db';
import { bookingDetailInclude, toDetailDto } from './bookings.mapper';
import { nextOrderNumber } from './order-number';

export async function createReservation(
  userId: string,
  input: CreateBookingRequest,
): Promise<BookingDetailDto> {
  const pricing = await resolveRoomPricing(input);
  assertCanBook(pricing, input.guestCount);
  const booking = await persistReservation(userId, input, pricing);
  return toDetailDto(booking, guestCaller(userId));
}

function assertCanBook(pricing: RoomPricing, guestCount: number): void {
  if (guestCount > pricing.capacity) {
    throw badRequest('Guest count exceeds room capacity');
  }
  if (!pricing.isAvailable) {
    throw conflict('Room is not available for the selected dates');
  }
}

async function persistReservation(
  userId: string,
  input: CreateBookingRequest,
  pricing: RoomPricing,
) {
  try {
    return await insertReservation(userId, input, pricing);
  } catch (error) {
    if (!isOrderNumberClash(error)) throw error;
    return insertReservation(userId, input, pricing);
  }
}

async function insertReservation(
  userId: string,
  input: CreateBookingRequest,
  pricing: RoomPricing,
) {
  const isolation = Prisma.TransactionIsolationLevel.Serializable;
  return prisma.$transaction((tx) => writeReservation(tx, userId, input, pricing), {
    isolationLevel: isolation,
  });
}

async function writeReservation(
  tx: BookingDb,
  userId: string,
  input: CreateBookingRequest,
  pricing: RoomPricing,
) {
  await assertStillAvailable(tx, input.roomId, input.checkIn, input.checkOut);
  const orderNumber = await nextOrderNumber(tx);
  return tx.booking.create({
    data: buildCreateData(userId, input, pricing, orderNumber),
    include: bookingDetailInclude,
  });
}

interface StayInput {
  userId: string;
  input: CreateBookingRequest;
  pricing: RoomPricing;
  orderNumber: string;
}

function buildCreateData(
  userId: string,
  input: CreateBookingRequest,
  pricing: RoomPricing,
  orderNumber: string,
) {
  return {
    ...staySnapshot({ userId, input, pricing, orderNumber }),
    paymentMethod: input.paymentMethod,
    paymentDeadline: addMinutes(new Date(), env.PAYMENT_DEADLINE_MINUTES),
    nights: { create: pricing.nights.map(toNightCreate) },
  };
}

function staySnapshot({ userId, input, pricing, orderNumber }: StayInput) {
  return {
    orderNumber,
    userId,
    roomId: input.roomId,
    propertyId: pricing.propertyId,
    checkIn: toDateOnly(input.checkIn),
    checkOut: toDateOnly(input.checkOut),
    guestCount: input.guestCount,
    totalPrice: sumNightPrices(pricing),
  };
}

function toNightCreate(night: NightlyRate) {
  return {
    date: night.date,
    basePrice: night.basePrice,
    finalPrice: night.finalPrice,
    peakSeasonRateName: night.peakSeasonRateName,
  };
}

function sumNightPrices(pricing: RoomPricing): number {
  return pricing.nights.reduce((sum, night) => sum + night.finalPrice, 0);
}

function isOrderNumberClash(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2002') return false;
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes('orderNumber');
}

function guestCaller(userId: string): JwtPayload {
  return { sub: userId, email: '', role: 'USER', isVerified: true };
}
