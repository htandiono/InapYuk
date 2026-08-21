import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, truncateAll } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

describe('GET /api/properties/cities', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('should return a list of unique cities and provinces', async () => {
    // 1. Seed some tenants and categories so we can create properties
    const user = await prisma.user.create({
      data: {
        email: 'tenant@example.com',
        name: 'Tenant 1',
        role: 'TENANT',
        isVerified: true,
      },
    });

    const tenant = await prisma.tenantProfile.create({
      data: {
        userId: user.id,
        companyName: 'Company',
      },
    });

    const category = await prisma.propertyCategory.create({
      data: {
        tenantId: tenant.id,
        name: 'Villa',
        slug: 'villa',
      },
    });

    // 2. Seed properties with duplicate cities
    await prisma.property.createMany({
      data: [
        {
          tenantId: tenant.id,
          categoryId: category.id,
          name: 'Prop 1',
          slug: 'prop-1',
          description: 'Desc',
          city: 'Bali',
          province: 'Bali',
          address: 'Jl. Legian',
        },
        {
          tenantId: tenant.id,
          categoryId: category.id,
          name: 'Prop 2',
          slug: 'prop-2',
          description: 'Desc',
          city: 'Bali',
          province: 'Bali',
          address: 'Jl. Seminyak',
        },
        {
          tenantId: tenant.id,
          categoryId: category.id,
          name: 'Prop 3',
          slug: 'prop-3',
          description: 'Desc',
          city: 'Yogyakarta',
          province: 'DI Yogyakarta',
          address: 'Jl. Malioboro',
        },
        // A deleted property that should be ignored
        {
          tenantId: tenant.id,
          categoryId: category.id,
          name: 'Prop 4',
          slug: 'prop-4',
          description: 'Desc',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          address: 'Jl. Sudirman',
          deletedAt: new Date(),
        },
      ],
    });

    const app = createTestApp();

    const res = await app.get('/api/properties/cities');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // We expect only Bali and Yogyakarta because Jakarta is deleted, 
    // and the two Bali properties should be deduplicated.
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        { city: 'Bali', province: 'Bali' },
        { city: 'Yogyakarta', province: 'DI Yogyakarta' },
      ])
    );
  });
});
