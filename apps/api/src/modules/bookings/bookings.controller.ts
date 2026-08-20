import { asyncHandler } from '../../utils/async-handler';
import { sendCreated, sendSuccess } from '../../utils/api-response';
import { unauthorized } from '../../utils/app-error';
import { createReservation, quoteStay } from './bookings.service';

export const quoteBooking = asyncHandler(async (req, res) => {
  const quote = await quoteStay(req.body);
  sendSuccess(res, quote, 'Quote calculated');
});

export const createBooking = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const booking = await createReservation(req.user.sub, req.body);
  sendCreated(res, booking, 'Booking created');
});
