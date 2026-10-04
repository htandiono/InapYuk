import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

describe('GET /api/properties', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('should list properties with correct server-side pagination and filters', async () => {
    // 1. Seed tenant and category
    const user = await prisma.user.create({
      data: {
        email: 't2@example.com',
        name: 'T2',
        role: 'TENANT',
        isVerified: true,
      },
    });
    const tenant = await prisma.tenantProfile.create({
      data: { userId: user.id, companyName: 'Company' },
    });
    const catVilla = await prisma.propertyCategory.create({
      data: { tenantId: tenant.id, name: 'Villa', slug: 'villa' },
    });
    const catApt = await prisma.propertyCategory.create({
      data: { tenantId: tenant.id, name: 'Apartment', slug: 'apartment' },
    });

    // 2. Seed properties
    const p1 = await prisma.property.create({
      data: {
        tenantId: tenant.id,
        categoryId: catVilla.id,
        name: 'Villa Bali',
        slug: 'villa-bali',
        description: 'Desc',
        city: 'Bali',
        province: 'Bali',
        address: 'Addr',
      },
    });
    const p2 = await prisma.property.create({
      data: {
        tenantId: tenant.id,
        categoryId: catApt.id,
        name: 'Apt Bali',
        slug: 'apt-bali',
        description: 'Desc',
        city: 'Bali',
        province: 'Bali',
        address: 'Addr',
      },
    });
    const p3 = await prisma.property.create({
      data: {
        tenantId: tenant.id,
        categoryId: catVilla.id,
        name: 'Villa Yogya',
        slug: 'villa-yogya',
        description: 'Desc',
        city: 'Yogyakarta',
        province: 'DIY',
        address: 'Addr',
      },
    });

    // 3. Seed rooms (so they have valid capacity)
    await prisma.room.create({
      data: {
        propertyId: p1.id,
        name: 'Room 1',
        description: 'Desc',
        basePrice: 500000,
        capacity: 2,
        totalUnits: 1,
      },
    });
    await prisma.room.create({
      data: {
        propertyId: p2.id,
        name: 'Room 1',
        description: 'Desc',
        basePrice: 300000,
        capacity: 2,
        totalUnits: 1,
      },
    });
    await prisma.room.create({
      data: {
        propertyId: p3.id,
        name: 'Room 1',
        description: 'Desc',
        basePrice: 400000,
        capacity: 2,
        totalUnits: 1,
      },
    });

    const app = createTestApp();

    // Test A: Filter by city=Bali
    const resA = await app.get('/api/properties?city=Bali');
    expect(resA.status).toBe(200);
    expect(resA.body.success).toBe(true);
    expect(resA.body.data.items).toHaveLength(2);
    expect(resA.body.data.meta.total).toBe(2);

    // Test B: Filter by name=Yogya
    const resB = await app.get('/api/properties?name=Yogya');
    expect(resB.status).toBe(200);
    expect(resB.body.data.items).toHaveLength(1);
    expect(resB.body.data.items[0].name).toBe('Villa Yogya');

    // Test C: Sort by price asc
    const resC = await app.get('/api/properties?city=Bali&sortBy=price&sortOrder=asc');
    expect(resC.status).toBe(200);
    expect(resC.body.data.items).toHaveLength(2);
    expect(resC.body.data.items[0].name).toBe('Apt Bali'); // 300k
    expect(resC.body.data.items[1].name).toBe('Villa Bali'); // 500k
  });
});
