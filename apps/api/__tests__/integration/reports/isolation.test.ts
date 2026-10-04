import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { truncateAll } from '../../../src/test/helpers';
import { bearer, seedBooking, seedPeople } from '../bookings/fixture';

const app = createApp();

describe('tenant reports stay on their own properties', () => {
  beforeEach(truncateAll);

  it('does not show another owner sales or bookings', async () => {
    const { guest, owner, other, stay, otherStay } = await seedPeople();
    await seedBooking({
      orderNumber: 'INP-20260901-0002',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'PROCESSED',
      checkIn: '2026-09-01',
      checkOut: '2026-09-02',
      withNight: true,
    });
    await seedBooking({
      orderNumber: 'INP-20260904-0001',
      userId: guest.id,
      propertyId: otherStay.propertyId,
      roomId: otherStay.roomId,
      status: 'PROCESSED',
      checkIn: '2026-09-04',
      checkOut: '2026-09-05',
      withNight: true,
    });

    const sales = await request(app)
      .get('/api/tenant/reports/sales')
      .query({ groupBy: 'transaction' })
      .set('Authorization', `Bearer ${bearer(owner.user)}`);
    expect(sales.status).toBe(200);
    const labels = sales.body.data.rows.map((row: { label: string }) => row.label);
    expect(labels).toContain('INP-20260901-0002');
    expect(labels).not.toContain('INP-20260904-0001');

    const orders = await request(app)
      .get('/api/tenant/bookings')
      .set('Authorization', `Bearer ${bearer(other.user)}`);
    const numbers = orders.body.data.items.map((row: { orderNumber: string }) => row.orderNumber);
    expect(numbers).toEqual(['INP-20260904-0001']);
  });

  it('keeps a guest out of the sales report', async () => {
    const { guest } = await seedPeople();
    const res = await request(app)
      .get('/api/tenant/reports/sales')
      .query({ groupBy: 'property' })
      .set('Authorization', `Bearer ${bearer(guest)}`);
    expect(res.status).toBe(403);
  });
});
