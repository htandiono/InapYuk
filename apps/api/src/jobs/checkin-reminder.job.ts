import type { JobDefinition, JobResult } from './types';
import { env } from '../config/env';
import { prisma } from '../libs/prisma';
import { logger } from '../libs/logger';
import { sendMail } from '../libs/mailer';
import { notifyUser } from '../modules/notifications/notify';
import { dayjs, formatDateKey, toDateOnly } from '../utils/date';

const JOB = 'checkin-reminder';

/**
 * Owner: Feature 2 (htandiono), Sprint 4.
 *
 * Emails every guest whose stay starts tomorrow. `Booking.reminderSentAt`
 * exists so a re-run never sends twice.
 */
export async function sendCheckinReminders(): Promise<JobResult> {
  const due = await findTomorrowStays();
  let processed = 0;
  for (const booking of due) {
    processed += await remindOne(booking);
  }
  logger.debug('sendCheckinReminders finished', { processed });
  return { job: JOB, processed };
}

function tomorrow() {
  return toDateOnly(dayjs.utc().add(1, 'day').format('YYYY-MM-DD'));
}

async function findTomorrowStays() {
  return prisma.booking.findMany({
    where: { status: 'PROCESSED', reminderSentAt: null, checkIn: tomorrow() },
    include: {
      user: { select: { id: true, name: true, email: true } },
      room: { select: { name: true } },
      property: { select: { name: true, address: true } },
    },
  });
}

type ReminderBooking = Awaited<ReturnType<typeof findTomorrowStays>>[number];

async function remindOne(booking: ReminderBooking): Promise<number> {
  const stamped = await prisma.booking.updateMany({
    where: { id: booking.id, reminderSentAt: null, status: 'PROCESSED' },
    data: { reminderSentAt: new Date() },
  });
  if (stamped.count === 0) return 0;
  await sendReminder(booking);
  return 1;
}

async function sendReminder(booking: ReminderBooking) {
  try {
    await sendMail({
      to: booking.user.email,
      subject: `Besok check-in di ${booking.property.name}`,
      template: 'checkin-reminder',
      context: reminderContext(booking),
    });
  } catch (error) {
    logger.error('Failed to send check-in reminder', error);
  }
  await notifyUser({
    userId: booking.user.id,
    type: 'CHECKIN_REMINDER',
    title: 'Check-in besok',
    body: `Menginap kamu di ${booking.property.name} dimulai besok.`,
    bookingId: booking.id,
  });
}

function reminderContext(booking: ReminderBooking) {
  return {
    guestName: booking.user.name,
    propertyName: booking.property.name,
    checkIn: formatDateKey(booking.checkIn),
    orderNumber: booking.orderNumber,
    roomName: booking.room.name,
    propertyAddress: booking.property.address,
    checkOut: formatDateKey(booking.checkOut),
    bookingUrl: `${env.WEB_BASE_URL}/orders/${booking.orderNumber}`,
  };
}

export const checkinReminderJob: JobDefinition = {
  name: JOB,
  schedule: '0 7 * * *',
  run: sendCheckinReminders,
};
