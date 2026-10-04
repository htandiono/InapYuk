import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { truncateAll } from '../../../src/test/helpers';
import { bearer, seedBooking, seedPeople } from './fixture';

const app = createApp();

describe('booking status changes', () => {
  beforeEach(truncateAll);

  it('lets the guest cancel an unpaid booking, and nobody else', async () => {
    const { guest, stranger, owner, stay } = await seedPeople();
    const booking = await seedBooking({
      orderNumber: 'INP-20261010-0001',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'WAITING_PAYMENT',
      checkIn: '2026-10-10',
      checkOut: '2026-10-12',
    });

    const strangerRes = await request(app)
      .patch(`/api/bookings/${booking.orderNumber}/cancel`)
      .set('Authorization', `Bearer ${bearer(stranger)}`)
      .send({});
    expect(strangerRes.status).toBe(404);

    const guestRes = await request(app)
      .patch(`/api/bookings/${booking.orderNumber}/cancel`)
      .set('Authorization', `Bearer ${bearer(guest)}`)
      .send({ reason: 'Jadwal berubah' });
    expect(guestRes.status).toBe(200);
    expect(guestRes.body.data.status).toBe('CANCELLED');

    const ownerList = await request(app)
      .get('/api/tenant/bookings')
      .set('Authorization', `Bearer ${bearer(owner.user)}`);
    expect(ownerList.body.data.items[0].status).toBe('CANCELLED');
  });

  it('refuses cancel once a payment proof is in', async () => {
    const { guest, stay } = await seedPeople();
    const booking = await seedBooking({
      orderNumber: 'INP-20261010-0002',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'WAITING_CONFIRMATION',
      checkIn: '2026-10-10',
      checkOut: '2026-10-12',
      withProof: true,
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking.orderNumber}/cancel`)
      .set('Authorization', `Bearer ${bearer(guest)}`)
      .send({});
    expect(res.status).toBe(409);
  });

  it('lets the owner accept a proof, and hides it from another owner', async () => {
    const { guest, owner, other, stay } = await seedPeople();
    const booking = await seedBooking({
      orderNumber: 'INP-20261010-0003',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'WAITING_CONFIRMATION',
      checkIn: '2026-10-10',
      checkOut: '2026-10-12',
      withProof: true,
    });

    const hidden = await request(app)
      .patch(`/api/tenant/bookings/${booking.orderNumber}/confirm`)
      .set('Authorization', `Bearer ${bearer(other.user)}`)
      .send({ accept: true });
    expect(hidden.status).toBe(404);

    const accepted = await request(app)
      .patch(`/api/tenant/bookings/${booking.orderNumber}/confirm`)
      .set('Authorization', `Bearer ${bearer(owner.user)}`)
      .send({ accept: true });
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.status).toBe('PROCESSED');
  });

  it('sends a rejected proof back to waiting for payment', async () => {
    const { guest, owner, stay } = await seedPeople();
    const booking = await seedBooking({
      orderNumber: 'INP-20261010-0004',
      userId: guest.id,
      propertyId: stay.propertyId,
      roomId: stay.roomId,
      status: 'WAITING_CONFIRMATION',
      checkIn: '2026-10-10',
      checkOut: '2026-10-12',
      withProof: true,
    });

    const res = await request(app)
      .patch(`/api/tenant/bookings/${booking.orderNumber}/confirm`)
      .set('Authorization', `Bearer ${bearer(owner.user)}`)
      .send({ accept: false, rejectionReason: 'Foto bukti buram' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('WAITING_PAYMENT');
    expect(res.body.data.paymentProofUrl ?? null).toBeNull();
  });

  it('blocks a guest from the owner booking list', async () => {
    const { guest } = await seedPeople();
    const res = await request(app)
      .get('/api/tenant/bookings')
      .set('Authorization', `Bearer ${bearer(guest)}`);
    expect(res.status).toBe(403);
  });
});
