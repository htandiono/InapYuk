import { prisma } from '../../libs/prisma';
import { uploadImage, deleteImage } from '../../libs/cloudinary';
import { badRequest } from '../../utils/app-error';
import type { UpdateProfileInput } from './users.schema';

export async function updateProfile(userId: string, input: UpdateProfileInput, file?: Express.Multer.File) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('Pengguna tidak ditemukan');

  let newAvatarUrl = user.avatarUrl;

  if (file) {
    newAvatarUrl = await uploadImage(file, 'avatars');
    if (user.avatarUrl) {
      await deleteImage(user.avatarUrl).catch(console.error);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name ?? user.name,
      avatarUrl: newAvatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      isVerified: true,
      provider: true,
    },
  });

  return updatedUser;
}
