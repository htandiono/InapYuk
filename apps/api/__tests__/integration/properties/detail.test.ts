import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

describe('Property Detail API', () => {
  let app: ReturnType<typeof createTestApp>;
  
  beforeEach(async () => {
    await truncateAll();
    app = createTestApp();
  });

  describe('GET /api/properties/:slug', () => {
    it('should return 404 for unknown slug', async () => {
      const res = await app.get('/api/properties/unknown-slug');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return property with rooms', async () => {
      const user = await prisma.user.create({
        data: { email: 't3@example.com', name: 'T3', role: 'TENANT', isVerified: true },
      });
      const tenant = await prisma.tenantProfile.create({
        data: { userId: user.id, companyName: 'Company' },
      });
      const cat = await prisma.propertyCategory.create({
        data: { tenantId: tenant.id, name: 'Villa', slug: 'villa' },
      });
      const prop = await prisma.property.create({
        data: {
          tenantId: tenant.id,
          categoryId: cat.id,
          name: 'The Luxe',
          slug: 'the-luxe',
          description: 'Desc',
          city: 'Bali',
          province: 'Bali',
          address: 'Addr',
        },
      });
      await prisma.room.create({
        data: {
          propertyId: prop.id,
          name: 'Master',
          description: 'Desc',
          basePrice: 1000000,
          capacity: 4,
          totalUnits: 2,
        },
      });

      const res = await app.get('/api/properties/the-luxe');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('The Luxe');
      expect(res.body.data.rooms).toHaveLength(1);
      expect(res.body.data.rooms[0].name).toBe('Master');
    });
  });

  describe('GET /api/properties/:slug/calendar', () => {
    it('should return calendar pricing for the month', async () => {
      const user = await prisma.user.create({
        data: { email: 't4@example.com', name: 'T4', role: 'TENANT', isVerified: true },
      });
      const tenant = await prisma.tenantProfile.create({
        data: { userId: user.id, companyName: 'Company' },
      });
      const cat = await prisma.propertyCategory.create({
        data: { tenantId: tenant.id, name: 'Villa', slug: 'villa' },
      });
      const prop = await prisma.property.create({
        data: {
          tenantId: tenant.id,
          categoryId: cat.id,
          name: 'The Luxe',
          slug: 'the-luxe-2',
          description: 'Desc',
          city: 'Bali',
          province: 'Bali',
          address: 'Addr',
        },
      });
      const room = await prisma.room.create({
        data: {
          propertyId: prop.id,
          name: 'Master',
          description: 'Desc',
          basePrice: 1000000,
          capacity: 4,
          totalUnits: 2,
        },
      });

      // Valid check for August 2026
      const res = await app.get(`/api/properties/the-luxe-2/calendar?roomId=${room.id}&month=8&year=2026`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // August has 31 days
      expect(res.body.data.length).toBe(31);
      expect(res.body.data[0].finalPrice).toBe(1000000); // base price
      expect(res.body.data[0].isAvailable).toBe(true);
    });
  });
});
