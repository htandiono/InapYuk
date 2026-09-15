import { prisma } from '../../libs/prisma';
import { verifyPassword, hashPassword } from '../../libs/password';
import { badRequest } from '../../utils/app-error';
import type { ChangePasswordInput } from './users.schema';

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('Pengguna tidak ditemukan');

  if (user.provider === 'GOOGLE' || !user.passwordHash) {
    throw badRequest('Akun ini menggunakan login sosial');
  }

  const isValidOld = await verifyPassword(input.oldPassword, user.passwordHash);
  if (!isValidOld) {
    throw badRequest('Password lama salah');
  }

  const newHash = await hashPassword(input.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}
