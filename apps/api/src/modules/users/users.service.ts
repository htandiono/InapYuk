import { prisma } from '../../libs/prisma';
import { uploadImage, deleteImage } from '../../libs/cloudinary';
import { logger } from '../../libs/logger';
import { badRequest } from '../../utils/app-error';
import type { UpdateProfileInput } from './users.schema';

async function handleAvatarUpload(
  userId: string,
  file?: Express.Multer.File,
  currentAvatarUrl?: string | null,
): Promise<string | undefined> {
  if (!file) return currentAvatarUrl ?? undefined;
  const newAvatarUrl = await uploadImage(file, 'avatars');
  if (currentAvatarUrl) {
    await deleteImage(currentAvatarUrl).catch((err) => logger.error('[AvatarDeleteError]', err));
  }
  return newAvatarUrl;
}

export async function updateProfile(userId: string, input: UpdateProfileInput, file?: Express.Multer.File) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('Pengguna tidak ditemukan');

  const newAvatarUrl = await handleAvatarUpload(userId, file, user.avatarUrl);
  return prisma.user.update({
    where: { id: userId },
    data: { name: input.name ?? user.name, avatarUrl: newAvatarUrl ?? user.avatarUrl },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, isVerified: true, provider: true },
  });
}
