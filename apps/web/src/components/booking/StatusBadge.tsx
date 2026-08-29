import { BOOKING_STATUS_LABEL, type BookingStatus } from '@inapyuk/types';
import { Badge } from '@/components/ui/badge';

const VARIANT: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  WAITING_PAYMENT: 'default',
  WAITING_CONFIRMATION: 'secondary',
  PROCESSED: 'outline',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={VARIANT[status]}>{BOOKING_STATUS_LABEL[status]}</Badge>;
}
