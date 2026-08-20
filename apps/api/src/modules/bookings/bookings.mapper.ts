import type {
  BookingDetailDto,
  BookingListItemDto,
  BookingNightDto,
  BookingStatus,
  CancelledBy,
  JwtPayload,
  PaymentMethod,
} from '@inapyuk/types';
import { countNights, formatDateKey } from '../../utils/date';
import { computeActions } from './bookings.actions';

export const bookingDetailInclude = {
  nights: { orderBy: { date: 'asc' as const } },
  user: { select: { id: true, name: true, email: true } },
  room: { select: { name: true } },
  property: {
    select: {
      name: true,
      tenantId: true,
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1, select: { url: true } },
    },
  },
  review: { select: { id: true } },
};

export interface BookingRecord {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  totalPrice: unknown;
  paymentMethod: string;
  paymentDeadline: Date | null;
  paymentProofUrl: string | null;
  paymentProofUploadedAt: Date | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  createdAt: Date;
  nights: Array<{
    date: Date;
    basePrice: unknown;
    finalPrice: unknown;
    peakSeasonRateName: string | null;
  }>;
  user: { id: string; name: string; email: string };
  room: { name: string };
  property: { name: string; tenantId: string; images: Array<{ url: string }> };
  review: { id: string } | null;
}

export function toDetailDto(booking: BookingRecord, caller: JwtPayload): BookingDetailDto {
  return {
    ...toListItemDto(booking),
    ...toPaymentFields(booking),
    nightBreakdown: booking.nights.map(toNightDto),
    guest: booking.user,
    ...computeActions(booking, caller),
  };
}

export function toListItemDto(booking: BookingRecord): BookingListItemDto {
  return {
    id: booking.id,
    orderNumber: booking.orderNumber,
    status: booking.status as BookingStatus,
    guestCount: booking.guestCount,
    totalPrice: toAmount(booking.totalPrice),
    ...toStayFields(booking),
    ...toListingFields(booking),
  };
}

function toStayFields(booking: BookingRecord) {
  return {
    checkIn: formatDateKey(booking.checkIn),
    checkOut: formatDateKey(booking.checkOut),
    nights: countNights(booking.checkIn, booking.checkOut),
    paymentDeadline: iso(booking.paymentDeadline),
    createdAt: booking.createdAt.toISOString(),
  };
}

function toListingFields(booking: BookingRecord) {
  return {
    propertyName: booking.property.name,
    roomName: booking.room.name,
    coverImageUrl: booking.property.images[0]?.url ?? null,
  };
}

function toPaymentFields(booking: BookingRecord) {
  return {
    paymentMethod: booking.paymentMethod as PaymentMethod,
    paymentProofUrl: booking.paymentProofUrl,
    paymentProofUploadedAt: iso(booking.paymentProofUploadedAt),
    confirmedAt: iso(booking.confirmedAt),
    cancelledAt: iso(booking.cancelledAt),
    cancelledBy: booking.cancelledBy as CancelledBy | null,
    cancelReason: booking.cancelReason,
  };
}

export function toNightDto(night: BookingRecord['nights'][number]): BookingNightDto {
  return {
    date: formatDateKey(night.date),
    basePrice: toAmount(night.basePrice),
    finalPrice: toAmount(night.finalPrice),
    peakSeasonRateName: night.peakSeasonRateName,
  };
}

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}
