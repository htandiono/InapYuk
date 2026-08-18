import type { PaginationQuery, SortOrder } from './api';
import type { BookingStatus, CancelledBy, PaymentMethod } from './enums';

/** Owner: Feature 2 (htandiono). */

export interface BookingNightDto {
  date: string;
  basePrice: number;
  finalPrice: number;
  peakSeasonRateName: string | null;
}

export interface BookingListItemDto {
  id: string;
  orderNumber: string;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  totalPrice: number;
  paymentDeadline: string | null;
  propertyName: string;
  roomName: string;
  coverImageUrl: string | null;
  createdAt: string;
}

export interface BookingDetailDto extends BookingListItemDto {
  paymentMethod: PaymentMethod;
  paymentProofUrl: string | null;
  paymentProofUploadedAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelledBy: CancelledBy | null;
  cancelReason: string | null;
  nightBreakdown: BookingNightDto[];
  guest: { id: string; name: string; email: string };
  canBeCancelled: boolean;
  canUploadPaymentProof: boolean;
  canBeReviewed: boolean;
}

export interface CreateBookingRequest {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  paymentMethod: PaymentMethod;
}

/** Price preview shown on checkout before the booking row exists. */
export interface BookingQuoteRequest {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

export interface BookingQuoteResponse {
  roomId: string;
  nights: BookingNightDto[];
  nightCount: number;
  subtotal: number;
  totalPrice: number;
  isAvailable: boolean;
  unavailableDates: string[];
}

export interface BookingListQuery extends PaginationQuery {
  status?: BookingStatus;
  orderNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  propertyId?: string;
  sortBy?: 'createdAt' | 'checkIn' | 'totalPrice';
  sortOrder?: SortOrder;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface ConfirmPaymentRequest {
  accept: boolean;
  rejectionReason?: string;
}
