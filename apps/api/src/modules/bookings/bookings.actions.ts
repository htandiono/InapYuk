import type { JwtPayload } from '@inapyuk/types';

export interface ActionSource {
  userId: string;
  status: string;
  paymentProofUploadedAt: Date | null;
  paymentDeadline: Date | null;
  review: { id: string } | null;
}

export function computeActions(booking: ActionSource, caller: JwtPayload) {
  const isGuest = caller.sub === booking.userId;
  const unpaid = isUnpaid(booking);
  return {
    canBeCancelled: unpaid && (isGuest || caller.role === 'TENANT'),
    canUploadPaymentProof: isGuest && unpaid && isBeforeDeadline(booking.paymentDeadline),
    canBeReviewed: isGuest && isReviewable(booking),
  };
}

function isUnpaid(booking: ActionSource): boolean {
  return booking.status === 'WAITING_PAYMENT' && booking.paymentProofUploadedAt === null;
}

function isBeforeDeadline(deadline: Date | null): boolean {
  return deadline !== null && deadline.getTime() > Date.now();
}

function isReviewable(booking: ActionSource): boolean {
  return booking.status === 'COMPLETED' && booking.review === null;
}
