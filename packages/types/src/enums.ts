/**
 * Mirrors the Prisma enums in apps/api/prisma/schema.prisma.
 * Shared so the web app never hardcodes status strings.
 */

export const UserRole = {
  USER: 'USER',
  TENANT: 'TENANT',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AuthProvider = {
  EMAIL: 'EMAIL',
  GOOGLE: 'GOOGLE',
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

export const VerificationTokenType = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  EMAIL_CHANGE: 'EMAIL_CHANGE',
} as const;
export type VerificationTokenType =
  (typeof VerificationTokenType)[keyof typeof VerificationTokenType];

export const BookingStatus = {
  WAITING_PAYMENT: 'WAITING_PAYMENT',
  WAITING_CONFIRMATION: 'WAITING_CONFIRMATION',
  PROCESSED: 'PROCESSED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

/** Indonesian labels used across the UI, matching the wording in the spec. */
export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  WAITING_PAYMENT: 'Menunggu Pembayaran',
  WAITING_CONFIRMATION: 'Menunggu Konfirmasi Pembayaran',
  PROCESSED: 'Diproses',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
};

export const PaymentMethod = {
  MANUAL_TRANSFER: 'MANUAL_TRANSFER',
  PAYMENT_GATEWAY: 'PAYMENT_GATEWAY',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PriceAdjustmentType = {
  NOMINAL: 'NOMINAL',
  PERCENTAGE: 'PERCENTAGE',
} as const;
export type PriceAdjustmentType = (typeof PriceAdjustmentType)[keyof typeof PriceAdjustmentType];

export const CancelledBy = {
  USER: 'USER',
  TENANT: 'TENANT',
  SYSTEM: 'SYSTEM',
} as const;
export type CancelledBy = (typeof CancelledBy)[keyof typeof CancelledBy];

export const NotificationType = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  PAYMENT_UPLOADED: 'PAYMENT_UPLOADED',
  PAYMENT_ACCEPTED: 'PAYMENT_ACCEPTED',
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  CHECKIN_REMINDER: 'CHECKIN_REMINDER',
  REVIEW_REPLY: 'REVIEW_REPLY',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
