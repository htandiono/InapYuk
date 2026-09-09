import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { prisma } from '../../../src/libs/prisma';
import { truncateAll } from '../../../src/test/helpers';
import { signAccessToken } from '../../../src/libs/jwt';

describe('Availability CRUD', () => {
  const app = createApp();
  const tenantId = 'test-tenant-id';
  const token = signAccessToken({ sub: 'test-user-id', email: 'tenant@test.com', role: 'TENANT', isVerified: true });
  let roomId: string;

  beforeEach(async () => {
    await truncateAll();

    const user = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'tenant@test.com',
        name: 'Test Tenant',
        passwordHash: 'hash',
        role: 'TENANT',
        isVerified: true
      }
    });
    
    await prisma.tenantProfile.create({
      data: { id: tenantId, userId: user.id, companyName: 'Test Company' }
    });
    
    const category = await prisma.propertyCategory.create({
      data: { name: 'Villa', slug: 'villa', tenantId }
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
        province: 'Test State'
      }
    });

    const room = await prisma.room.create({
      data: {
        propertyId: property.id,
        name: 'Deluxe Room',
        description: 'Nice room',
        basePrice: 500000,
        capacity: 2,
        totalUnits: 5
      }
    });
    roomId = room.id;
  });

  describe('PUT /api/rooms/tenant/rooms/:id/availability', () => {
    it('should create or update room availability', async () => {
      const res = await request(app)
        .put(`/api/rooms/tenant/rooms/${roomId}/availability`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          startDate: '2026-10-01',
          endDate: '2026-10-02',
          isAvailable: false,
          availableUnits: 0
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const availabilities = await prisma.roomAvailability.findMany({
        where: { roomId }
      });
      expect(availabilities.length).toBe(2); // Oct 1 and Oct 2
      expect(availabilities[0].isAvailable).toBe(false);
      expect(availabilities[0].availableUnits).toBe(0);
    });

    it('should return 400 for invalid date range', async () => {
      const res = await request(app)
        .put(`/api/rooms/tenant/rooms/${roomId}/availability`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          startDate: '2026-10-02',
          endDate: '2026-10-01',
          isAvailable: false
        });

      expect(res.status).toBe(400);
    });
  });
});
