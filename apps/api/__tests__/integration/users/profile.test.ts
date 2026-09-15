import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestApp, truncateAll, getAuthCookies } from '../../../src/test/helpers';
import { prisma } from '../../../src/libs/prisma';

vi.mock('../../../src/libs/cloudinary', () => ({
  uploadImage: vi.fn().mockResolvedValue('http://mocked-cloudinary.com/avatar.jpg'),
  deleteImage: vi.fn().mockResolvedValue(undefined),
}));

const { uploadImage, deleteImage } = await import('../../../src/libs/cloudinary');

describe('PATCH /api/users/profile', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await truncateAll();
  });

  async function seedUser(avatarUrl: string | null = null) {
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        name: 'Old Name',
        role: 'USER',
        isVerified: true,
        avatarUrl,
      },
    });

    const cookies = await getAuthCookies(user);
    return { user, cookies };
  }

  it('should update name without avatar (200)', async () => {
    const app = createTestApp();
    const { user, cookies } = await seedUser();

    const res = await app
      .patch('/api/users/profile')
      .set('Cookie', cookies)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated!.name).toBe('New Name');
    expect(updated!.avatarUrl).toBeNull();
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it('should update name and avatar, deleting old avatar (200)', async () => {
    const app = createTestApp();
    const { user, cookies } = await seedUser('http://old-avatar.jpg');

    const res = await app
      .patch('/api/users/profile')
      .set('Cookie', cookies)
      .field('name', 'New Name with Avatar')
      .attach('avatar', Buffer.from('fake-image-content'), 'avatar.jpg');

    expect(res.status).toBe(200);

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated!.name).toBe('New Name with Avatar');
    expect(updated!.avatarUrl).toBe('http://mocked-cloudinary.com/avatar.jpg');

    expect(uploadImage).toHaveBeenCalledOnce();
    expect(deleteImage).toHaveBeenCalledOnce();
    expect(deleteImage).toHaveBeenCalledWith('http://old-avatar.jpg');
  });

  it('should return 401 if not authenticated', async () => {
    const app = createTestApp();
    const res = await app.patch('/api/users/profile').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });
});
