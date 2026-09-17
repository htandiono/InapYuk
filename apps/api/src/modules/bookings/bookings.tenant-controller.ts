import type {
  BookingListQuery,
  CancelBookingRequest,
  ConfirmPaymentRequest,
} from '@inapyuk/types';
import { asyncHandler } from '../../utils/async-handler';
import { sendPaginated, sendSuccess } from '../../utils/api-response';
import { unauthorized } from '../../utils/app-error';
import { cancelTenantBooking, confirmPayment, listTenantBookings } from './bookings.service';

function tenantIdOf(req: { tenantId?: string; user?: unknown }): string {
  if (!req.user) throw unauthorized();
  if (!req.tenantId) throw unauthorized();
  return req.tenantId;
}

export const listTenantOrders = asyncHandler(async (req, res) => {
  const result = await listTenantBookings(tenantIdOf(req), req.query as BookingListQuery);
  sendPaginated(res, result.items, result.meta, 'Daftar pesanan properti kamu');
});

export const confirmTenantOrder = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const body = req.body as ConfirmPaymentRequest;
  const booking = await confirmPayment(
    String(req.params.orderNumber),
    tenantIdOf(req),
    req.user,
    body,
  );
  sendSuccess(res, booking, body.accept ? 'Pembayaran diterima' : 'Bukti transfer ditolak');
});

export const cancelTenantOrder = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const body = req.body as CancelBookingRequest;
  const booking = await cancelTenantBooking(
    String(req.params.orderNumber),
    tenantIdOf(req),
    req.user,
    body.reason,
  );
  sendSuccess(res, booking, 'Pesanan sudah dibatalkan');
});
