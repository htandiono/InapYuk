import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { truncateAll } from '../../../src/test/helpers';
import { bearer, seedBooking, seedPeople } from '../bookings/fixture';

const app = createApp();
const comment = 'Kamarnya bersih dan pemiliknya ramah.';

describe('one review per stay', () => {
  beforeEach(truncateAll);

  it('lets the guest review a finished stay once', async () => {
    const { guest, stranger, stay } = await seedPeople();
    const booking = await seedBooking({
      orderNumber: 'INP-20260901-0001',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'COMPLETED',
      checkIn: '2026-09-01',
      checkOut: '2026-09-03',
    });

    const first = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${bearer(guest)}`)
      .send({ bookingId: booking.id, rating: 5, comment });
    expect(first.status).toBe(201);
    expect(first.body.data.rating).toBe(5);

    const second = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${bearer(guest)}`)
      .send({ bookingId: booking.id, rating: 4, comment });
    expect(second.status).toBe(409);

    const other = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${bearer(stranger)}`)
      .send({ bookingId: booking.id, rating: 1, comment });
    expect(other.status).toBe(404);
  });

  it('refuses a review before the stay is finished', async () => {
    const { guest, stay } = await seedPeople();
    const booking = await seedBooking({
      orderNumber: 'INP-20261010-0005',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'PROCESSED',
      checkIn: '2026-10-10',
      checkOut: '2026-10-12',
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${bearer(guest)}`)
      .send({ bookingId: booking.id, rating: 5, comment });
    expect(res.status).toBe(409);
  });
});
