import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { prisma } from '../../../src/libs/prisma';
import { truncateAll } from '../../../src/test/helpers';

describe('Pricing Calendar Integration', () => {
  const app = createApp();
  const tenantId = 'test-tenant-id';
  let propertySlug: string;
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
    propertySlug = property.slug;

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

    // Create a peak season rate
    await prisma.peakSeasonRate.create({
      data: {
        roomId,
        name: 'Holiday',
        startDate: new Date('2026-12-24'),
        endDate: new Date('2026-12-26'), // 3 days
        adjustmentType: 'NOMINAL',
        adjustmentValue: 100000, // +100k
      },
    });

    // Create availability block
    await prisma.roomAvailability.create({
      data: {
        roomId,
        date: new Date('2026-12-25'),
        isAvailable: false,
      },
    });
  });

  describe('GET /api/properties/:slug/calendar', () => {
    it('should return computed pricing reflecting base price, peak rates, and availability', async () => {
      const res = await request(app).get(
        `/api/properties/${propertySlug}/calendar?roomId=${roomId}&month=12&year=2026`,
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const nights = res.body.data;
      expect(nights).toBeInstanceOf(Array);

      // Dec 24: Holiday rate (+100k), available
      const dec24 = nights.find((n: { date: string }) => n.date.startsWith('2026-12-24'));
      expect(dec24).toBeDefined();
      expect(dec24.basePrice).toBe(500000);
      expect(dec24.finalPrice).toBe(600000);
      expect(dec24.isAvailable).toBe(true);

      // Dec 25: Holiday rate, NOT available
      const dec25 = nights.find((n: { date: string }) => n.date.startsWith('2026-12-25'));
      expect(dec25).toBeDefined();
      expect(dec25.basePrice).toBe(500000);
      expect(dec25.finalPrice).toBe(600000);
      expect(dec25.isAvailable).toBe(false); // blocked

      // Dec 27: Normal day
      const dec27 = nights.find((n: { date: string }) => n.date.startsWith('2026-12-27'));
      expect(dec27).toBeDefined();
      expect(dec27.basePrice).toBe(500000);
      expect(dec27.finalPrice).toBe(500000);
      expect(dec27.isAvailable).toBe(true);
    });
  });
});
