import { env } from '../../config/env';
import { logger } from '../../libs/logger';
import { sendMail } from '../../libs/mailer';
import { formatDateKey } from '../../utils/date';
import { toAmount } from './bookings.mapper';
import type { BookingRecord } from './bookings.mapper';

const HOUSE_RULES = [
  'Check-in mulai pukul 14.00, check-out sebelum pukul 12.00.',
  'Jumlah tamu harus sesuai dengan yang dipesan.',
  'Dilarang merokok di dalam kamar.',
  'Kembalikan kunci saat check-out.',
];

/** Email is best-effort: a mailbox outage must not undo the confirmation. */
export async function sendBookingConfirmedMail(booking: BookingRecord): Promise<void> {
  try {
    await sendMail({
      to: booking.user.email,
      subject: `Pembayaran ${booking.orderNumber} sudah diterima`,
      template: 'booking-confirmed',
      context: mailContext(booking),
    });
  } catch (error) {
    logger.error('Failed to send booking-confirmed email', error);
  }
}

function mailContext(booking: BookingRecord) {
  return {
    guestName: booking.user.name,
    orderNumber: booking.orderNumber,
    propertyName: booking.property.name,
    roomName: booking.room.name,
    checkIn: formatDateKey(booking.checkIn),
    checkOut: formatDateKey(booking.checkOut),
    guestCount: booking.guestCount,
    totalPrice: formatRupiah(toAmount(booking.totalPrice)),
    houseRules: HOUSE_RULES,
    bookingUrl: `${env.WEB_BASE_URL}/orders/${booking.orderNumber}`,
  };
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}
