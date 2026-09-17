import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { prisma } from '../../../src/libs/prisma';
import { truncateAll } from '../../../src/test/helpers';
import { signAccessToken } from '../../../src/libs/jwt';

describe('Peak Season Rates CRUD', () => {
  const app = createApp();
  const tenantId = 'test-tenant-id';
  const token = signAccessToken({
    sub: 'test-user-id',
    email: 'tenant@test.com',
    role: 'TENANT',
    isVerified: true,
  });
  let roomId: string;
  let rateId: string;

  beforeEach(async () => {
    await truncateAll();

    const user = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'tenant@test.com',
        name: 'Test Tenant',
        passwordHash: 'hash',
        role: 'TENANT',
        isVerified: true,
      },
    });

    await prisma.tenantProfile.create({
      data: { id: tenantId, userId: user.id, companyName: 'Test Company' },
    });

    const category = await prisma.propertyCategory.create({
      data: { name: 'Villa', slug: 'villa', tenantId },
    });

    const property = await prisma.property.create({
      data: {
        tenantId,
        categoryId: category.id,
        name: 'Test Property',
        slug: 'test-property',
        description: 'A test property',
        address: 'Test Address',
        city: 'Test City',
        province: 'Test State',
      },
    });

    const room = await prisma.room.create({
      data: {
        propertyId: property.id,
        name: 'Deluxe Room',
        description: 'Nice room',
        basePrice: 500000,
        capacity: 2,
        totalUnits: 5,
      },
    });
    roomId = room.id;

    const rate = await prisma.peakSeasonRate.create({
      data: {
        roomId,
        name: 'Initial Rate',
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-12-31'),
        adjustmentType: 'NOMINAL',
        adjustmentValue: 100000,
      },
    });
    rateId = rate.id;
  });

  describe('GET /api/rooms/tenant/rooms/:id/peak-season', () => {
    it('should list peak season rates', async () => {
      const res = await request(app)
        .get(`/api/rooms/tenant/rooms/${roomId}/peak-season`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Initial Rate');
    });
  });

  describe('POST /api/rooms/tenant/rooms/:id/peak-season', () => {
    it('should create a new peak season rate', async () => {
      const res = await request(app)
        .post(`/api/rooms/tenant/rooms/${roomId}/peak-season`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Year',
          startDate: '2027-01-01',
          endDate: '2027-01-05',
          adjustmentType: 'PERCENTAGE',
          adjustmentValue: 20,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Year');
    });
  });

  describe('PATCH /api/rooms/tenant/peak-season/:id', () => {
    it('should update peak season rate', async () => {
      const res = await request(app)
        .patch(`/api/rooms/tenant/peak-season/${rateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Rate',
          adjustmentValue: 150000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Rate');
      expect(Number(res.body.data.adjustmentValue)).toBe(150000);
    });
  });

  describe('DELETE /api/rooms/tenant/peak-season/:id', () => {
    it('should delete peak season rate', async () => {
      const res = await request(app)
        .delete(`/api/rooms/tenant/peak-season/${rateId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const dbCheck = await prisma.peakSeasonRate.findUnique({ where: { id: rateId } });
      expect(dbCheck).toBeNull();
    });
  });
});
