import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { prisma } from '../../../src/libs/prisma';
import { truncateAll } from '../../../src/test/helpers';
import { signAccessToken } from '../../../src/libs/jwt';

vi.mock('../../../src/libs/cloudinary', () => {
  return {
    uploadImage: vi.fn().mockResolvedValue('https://res.cloudinary.com/demo/image/upload/sample.jpg'),
    default: {
      uploader: {
        upload: vi.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
      }
    }
  };
});

vi.mock('../../../src/libs/opencage', () => {
  return {
    geocodeAddress: vi.fn().mockResolvedValue({ lat: -8.409518, lng: 115.188919 })
  };
});

describe('Properties CRUD', () => {
  const app = createApp();
  let tenantToken: string;
  let tenantId: string;
  let categoryId: string;

  beforeEach(async () => {
    await truncateAll();

    const user = await prisma.user.create({
      data: {
        id: 'test-tenant-1',
        email: 'tenant.bali@inapyuk.space',
        passwordHash: 'hashedpassword',
        name: 'Tenant Bali',
        role: 'TENANT',
        isVerified: true,
      }
    });

    const tenantProfile = await prisma.tenantProfile.create({
      data: {
        id: 'tenant-profile-1',
        userId: user.id,
        companyName: 'Bali Co',
      }
    });

    tenantId = tenantProfile.id;
    tenantToken = signAccessToken({ sub: user.id, email: user.email, role: user.role, isVerified: user.isVerified });

    const cat = await prisma.propertyCategory.create({
      data: { name: 'Vila', slug: 'vila', tenantId }
    });
    categoryId = cat.id;
  });

  describe('POST /api/properties/tenant/properties', () => {
    it('should create a property with images', async () => {
      // Mock geocoding is handled via vi.mock at the top of the file

      const res = await request(app)
        .post('/api/properties/tenant/properties')
        .set('Cookie', `accessToken=${tenantToken}`)
        .field('name', 'Vila Baru')
        .field('categoryId', categoryId)
        .field('description', 'Deskripsi vila baru di bali')
        .field('address', 'Jalan Raya Ubud No 1')
        .field('city', 'Gianyar')
        .field('state', 'Bali')
        .attach('images', Buffer.from('fake image data'), 'test1.jpg');

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Vila Baru');
      expect(res.body.data.slug).toBe('vila-baru');
      expect(res.body.data.latitude).toEqual(expect.any(Number));
      expect(res.body.data.longitude).toEqual(expect.any(Number));
      expect(res.body.data.images).toHaveLength(1);
    });
  });
});
