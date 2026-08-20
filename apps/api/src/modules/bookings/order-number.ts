import { dayjs } from '../../utils/date';
import type { BookingDb } from './bookings.db';

const PREFIX = 'INP';
const SEQ_WIDTH = 4;

export function formatOrderNumber(date: Date, sequence: number): string {
  const stamp = dayjs.utc(date).format('YYYYMMDD');
  return `${PREFIX}-${stamp}-${String(sequence).padStart(SEQ_WIDTH, '0')}`;
}

export async function nextOrderNumber(db: BookingDb, now = new Date()): Promise<string> {
  const prefix = `${PREFIX}-${dayjs.utc(now).format('YYYYMMDD')}-`;
  const last = await db.booking.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });
  const sequence = last ? Number(last.orderNumber.slice(-SEQ_WIDTH)) + 1 : 1;
  return formatOrderNumber(now, sequence);
}
