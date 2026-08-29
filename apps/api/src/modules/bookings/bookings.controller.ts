import type { BookingListQuery, CancelBookingRequest } from '@inapyuk/types';
import { asyncHandler } from '../../utils/async-handler';
import { sendCreated, sendPaginated, sendSuccess } from '../../utils/api-response';
import { unauthorized } from '../../utils/app-error';
import {
  cancelGuestBooking,
  createReservation,
  getByOrderNumber,
  listGuestBookings,
  quoteStay,
  uploadPaymentProof,
} from './bookings.service';

export const quoteBooking = asyncHandler(async (req, res) => {
  const quote = await quoteStay(req.body);
  sendSuccess(res, quote, 'Quote calculated');
});

export const createBooking = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const booking = await createReservation(req.user.sub, req.body);
  sendCreated(res, booking, 'Booking created');
});

export const getBooking = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const booking = await getByOrderNumber(String(req.params.orderNumber), req.user);
  sendSuccess(res, booking, 'Booking retrieved');
});

export const listBookings = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const result = await listGuestBookings(req.user.sub, req.query as BookingListQuery);
  sendPaginated(res, result.items, result.meta, 'Daftar pesanan kamu');
});

export const uploadProof = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const booking = await uploadPaymentProof(
    String(req.params.orderNumber),
    req.user,
    req.file,
  );
  sendSuccess(res, booking, 'Bukti transfer sudah kami terima');
});

export const cancelBooking = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const body = req.body as CancelBookingRequest;
  const booking = await cancelGuestBooking(String(req.params.orderNumber), req.user, body.reason);
  sendSuccess(res, booking, 'Pesanan sudah dibatalkan');
});
