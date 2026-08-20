import { asyncHandler } from '../../utils/async-handler';
import { sendSuccess } from '../../utils/api-response';
import { quoteStay } from './bookings.service';

export const quoteBooking = asyncHandler(async (req, res) => {
  const quote = await quoteStay(req.body);
  sendSuccess(res, quote, 'Quote calculated');
});
