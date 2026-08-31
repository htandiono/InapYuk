import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { prisma } from '../../../src/libs/prisma';
import { truncateAll } from '../../../src/test/helpers';
import { signAccessToken } from '../../../src/libs/jwt';

describe('Categories CRUD', () => {
  const app = createApp();
  let tenantToken: string;
  let tenantId: string;
  let userToken: string;

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

    const user2 = await prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'budi@inapyuk.space',
        passwordHash: 'hashedpassword',
        name: 'Budi',
        role: 'USER',
        isVerified: true,
      }
    });
    userToken = signAccessToken({ sub: user2.id, email: user2.email, role: user2.role, isVerified: user2.isVerified });
  });

  describe('POST /api/categories/tenant/categories', () => {
    it('should create a category scoped to the tenant', async () => {
      const res = await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Vila Mewah' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Vila Mewah');
      expect(res.body.data.slug).toBe('vila-mewah');
      expect(res.body.data.tenantId).toBe(tenantId);
    });

    it('should return 409 if category name already exists for the same tenant', async () => {
      await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Vila Mewah' });

      const res = await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Vila Mewah' });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Kategori sudah ada');
    });

    it('should return 403 if accessed by a non-tenant', async () => {
      const res = await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${userToken}`)
        .send({ name: 'Vila Mewah' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/categories/tenant/categories', () => {
    it('should return paginated categories for the tenant', async () => {
      await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Vila 1' });
      
      await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Vila 2' });

      const res = await request(app)
        .get('/api/categories/tenant/categories?page=1&limit=1')
        .set('Cookie', `accessToken=${tenantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.meta.total).toBe(2);
      expect(res.body.data.meta.page).toBe(1);
      expect(res.body.data.meta.totalPages).toBe(2);
    });

    it('should not return soft deleted categories', async () => {
      const created = await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Vila Hapus' });

      await request(app)
        .delete(`/api/categories/tenant/categories/${created.body.data.id}`)
        .set('Cookie', `accessToken=${tenantToken}`);

      const res = await request(app)
        .get('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`);

      expect(res.body.data.items).toHaveLength(0);
    });
  });

  describe('PATCH /api/categories/tenant/categories/:id', () => {
    it('should update a category', async () => {
      const created = await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Kos Lama' });

      const res = await request(app)
        .patch(`/api/categories/tenant/categories/${created.body.data.id}`)
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Kos Baru' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Kos Baru');
      expect(res.body.data.slug).toBe('kos-baru');
    });

    it('should return 409 if new name conflicts', async () => {
      await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Kos A' });

      const createdB = await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Kos B' });

      const res = await request(app)
        .patch(`/api/categories/tenant/categories/${createdB.body.data.id}`)
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'Kos A' });

      expect(res.status).toBe(409);
    });

    it('should return 403 if trying to update another tenants category', async () => {
      // Create category as tenant.bali
      const created = await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'My Kos' });

      // Use isolated token
      const jogjaToken = signAccessToken({ sub: 'tenant-jogja-id', email: 'j@j.com', role: 'TENANT', isVerified: true });

      const res = await request(app)
        .patch(`/api/categories/tenant/categories/${created.body.data.id}`)
        .set('Cookie', `accessToken=${jogjaToken}`)
        .send({ name: 'Stolen Kos' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/categories/tenant/categories/:id', () => {
    it('should soft delete the category', async () => {
      const created = await request(app)
        .post('/api/categories/tenant/categories')
        .set('Cookie', `accessToken=${tenantToken}`)
        .send({ name: 'To Delete' });

      const res = await request(app)
        .delete(`/api/categories/tenant/categories/${created.body.data.id}`)
        .set('Cookie', `accessToken=${tenantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.deletedAt).toBeDefined();

      const dbCheck = await prisma.propertyCategory.findUnique({
        where: { id: created.body.data.id }
      });
      expect(dbCheck?.deletedAt).not.toBeNull();
    });
  });
});
