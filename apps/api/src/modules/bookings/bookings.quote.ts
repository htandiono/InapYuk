import type { BookingNightDto, BookingQuoteRequest, BookingQuoteResponse } from '@inapyuk/types';
import {
  resolveRoomPricing,
  type NightlyRate,
  type RoomPricing,
} from '../../services/pricing.service';
import { formatDateKey } from '../../utils/date';
import { badRequest } from '../../utils/app-error';

export async function quoteStay(input: BookingQuoteRequest): Promise<BookingQuoteResponse> {
  const pricing = await resolveRoomPricing(input);
  if (input.guestCount > pricing.capacity) {
    throw badRequest('Guest count exceeds room capacity');
  }
  return toQuote(pricing);
}

function toQuote(pricing: RoomPricing): BookingQuoteResponse {
  return {
    roomId: pricing.roomId,
    nights: pricing.nights.map(toQuoteNight),
    nightCount: pricing.nightCount,
    subtotal: pricing.totalPrice,
    totalPrice: pricing.totalPrice,
    isAvailable: pricing.isAvailable,
    unavailableDates: pricing.unavailableDates,
  };
}

function toQuoteNight(night: NightlyRate): BookingNightDto {
  return {
    date: formatDateKey(night.date),
    basePrice: night.basePrice,
    finalPrice: night.finalPrice,
    peakSeasonRateName: night.peakSeasonRateName,
  };
}
