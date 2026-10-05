import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { truncateAll } from '../../../src/test/helpers';
import { bearer, seedBooking, seedPeople } from '../bookings/fixture';

const app = createApp();

describe('sales report filters', () => {
  beforeEach(truncateAll);

  it('filters by date and sorts by total', async () => {
    const { guest, owner, stay } = await seedPeople();
    await seedPaid(guest.id, stay, 'INP-20260901-0003', '2026-09-01', 200000);
    await seedPaid(guest.id, stay, 'INP-20260910-0001', '2026-09-10', 800000);

    const ranged = await request(app)
      .get('/api/tenant/reports/sales')
      .query({ groupBy: 'transaction', dateFrom: '2026-09-10', dateTo: '2026-09-10' })
      .set('Authorization', `Bearer ${bearer(owner.user)}`);
    expect(ranged.status).toBe(200);
    expect(ranged.body.data.rows.map((row: { label: string }) => row.label)).toEqual([
      'INP-20260910-0001',
    ]);

    const sorted = await request(app)
      .get('/api/tenant/reports/sales')
      .query({ groupBy: 'transaction', sortBy: 'total', sortOrder: 'asc' })
      .set('Authorization', `Bearer ${bearer(owner.user)}`);
    const labels = sorted.body.data.rows.map((row: { label: string }) => row.label);
    expect(labels).toEqual(['INP-20260901-0003', 'INP-20260910-0001']);
  });
});

function seedPaid(
  userId: string,
  stay: { propertyId: string; roomId: string },
  orderNumber: string,
  checkIn: string,
  totalPrice: number,
) {
  const [year, month, day] = checkIn.split('-');
  const checkOut = `${year}-${month}-${String(Number(day) + 1).padStart(2, '0')}`;
  return seedBooking({
    orderNumber,
    userId,
    propertyId: stay.propertyId,
    roomId: stay.roomId,
    status: 'PROCESSED',
    checkIn,
    checkOut,
    withNight: true,
    totalPrice,
  });
}
