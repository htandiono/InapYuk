import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * Nightly rates are keyed by calendar date, so every date used as a map key or
 * a Prisma `@db.Date` value is normalised to UTC midnight first. Without this,
 * a machine in UTC+7 silently shifts every night by one day.
 */
export function toDateOnly(value: Date | string): Date {
  return dayjs.utc(dayjs(value).format('YYYY-MM-DD')).toDate();
}

export function formatDateKey(value: Date | string): string {
  return dayjs(value).format('YYYY-MM-DD');
}

/**
 * Nights between check-in and check-out, excluding the check-out day itself -
 * a guest staying the 1st to the 3rd pays for the 1st and the 2nd.
 */
export function eachNight(checkIn: Date | string, checkOut: Date | string): Date[] {
  const start = dayjs.utc(formatDateKey(checkIn));
  const end = dayjs.utc(formatDateKey(checkOut));
  const nights: Date[] = [];
  for (let cursor = start; cursor.isBefore(end); cursor = cursor.add(1, 'day')) {
    nights.push(cursor.toDate());
  }
  return nights;
}

export function countNights(checkIn: Date | string, checkOut: Date | string): number {
  return dayjs.utc(formatDateKey(checkOut)).diff(dayjs.utc(formatDateKey(checkIn)), 'day');
}

export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const target = dayjs.utc(formatDateKey(date));
  return (
    !target.isBefore(dayjs.utc(formatDateKey(start))) &&
    !target.isAfter(dayjs.utc(formatDateKey(end)))
  );
}

export function addMinutes(date: Date, minutes: number): Date {
  return dayjs(date).add(minutes, 'minute').toDate();
}

export { dayjs };
