import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { truncateAll } from '../../../src/test/helpers';
import { bearer, seedBooking, seedPeople } from './fixture';

const app = createApp();

describe('owner cancel', () => {
  beforeEach(truncateAll);

  it('lets the owner cancel an unpaid booking', async () => {
    const { guest, owner, stay } = await seedPeople();
    const booking = await seedBooking({
      orderNumber: 'INP-20261020-0001',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'WAITING_PAYMENT',
      checkIn: '2026-10-20',
      checkOut: '2026-10-22',
    });

    const res = await request(app)
      .patch(`/api/tenant/bookings/${booking.orderNumber}/cancel`)
      .set('Authorization', `Bearer ${bearer(owner.user)}`)
      .send({ reason: 'Kamar sedang diperbaiki' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
    expect(res.body.data.cancelledBy).toBe('TENANT');
  });

  it('refuses an owner cancel after a proof is uploaded', async () => {
    const { guest, owner, stay } = await seedPeople();
    const booking = await seedBooking({
      orderNumber: 'INP-20261020-0002',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'WAITING_CONFIRMATION',
      checkIn: '2026-10-20',
      checkOut: '2026-10-22',
      withProof: true,
    });

    const res = await request(app)
      .patch(`/api/tenant/bookings/${booking.orderNumber}/cancel`)
      .set('Authorization', `Bearer ${bearer(owner.user)}`)
      .send({});

    expect(res.status).toBe(409);
  });
});
