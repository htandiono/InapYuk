import type { BookingStatus } from '@inapyuk/types';
import { conflict } from '../../utils/app-error';

/**
 * Legal moves from docs/ERD.md. User/tenant cancel is only allowed before a
 * payment proof exists, so CANCELLED is reachable from WAITING_PAYMENT only.
 */
const TRANSITIONS = {
  WAITING_PAYMENT: ['WAITING_CONFIRMATION', 'CANCELLED'],
  WAITING_CONFIRMATION: ['PROCESSED', 'WAITING_PAYMENT'],
  PROCESSED: ['COMPLETED'],
  CANCELLED: [],
  COMPLETED: [],
} as const satisfies Record<BookingStatus, readonly BookingStatus[]>;

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return (TRANSITIONS[from] as readonly BookingStatus[]).includes(to);
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) {
    throw conflict(`Cannot move a booking from ${from} to ${to}`);
  }
}
