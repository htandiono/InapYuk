import { asyncHandler } from '../../utils/async-handler';
import { sendCreated, sendSuccess } from '../../utils/api-response';
import { unauthorized } from '../../utils/app-error';
import { createReservation, getByOrderNumber, quoteStay } from './bookings.service';

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
