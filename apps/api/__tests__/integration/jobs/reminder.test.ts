import { beforeEach, describe, expect, it } from 'vitest';
import { sendCheckinReminders } from '../../../src/jobs/checkin-reminder.job';
import { prisma } from '../../../src/libs/prisma';
import { truncateAll } from '../../../src/test/helpers';
import { dayjs } from '../../../src/utils/date';
import { seedBooking, seedPeople } from '../bookings/fixture';

describe('check-in reminder', () => {
  beforeEach(truncateAll);

  it('reminds a guest once, the day before check-in', async () => {
    const { guest, stay } = await seedPeople();
    const checkIn = dayjs.utc().add(1, 'day').format('YYYY-MM-DD');
    const checkOut = dayjs.utc().add(2, 'day').format('YYYY-MM-DD');
    const stamp = checkIn.replaceAll('-', '');
    await seedBooking({
      orderNumber: `INP-${stamp}-0001`,
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'PROCESSED',
      checkIn,
      checkOut,
    });

    const first = await sendCheckinReminders();
    const second = await sendCheckinReminders();
    const notes = await prisma.notification.findMany({ where: { userId: guest.id } });

    expect(first.processed).toBe(1);
    expect(second.processed).toBe(0);
    expect(notes).toHaveLength(1);
    expect(notes[0]?.type).toBe('CHECKIN_REMINDER');
  });
});
