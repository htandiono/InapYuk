import { prisma } from '../../libs/prisma';
import { verifyPassword, hashPassword } from '../../libs/password';
import { badRequest } from '../../utils/app-error';
import type { ChangePasswordInput } from './users.schema';

async function validatePasswordChange(user: { provider: string; passwordHash: string | null }, input: ChangePasswordInput) {
  if (user.provider === 'GOOGLE' || !user.passwordHash) throw badRequest('Akun ini menggunakan login sosial');
  if (!(await verifyPassword(input.oldPassword, user.passwordHash))) throw badRequest('Password lama salah');
  if (await verifyPassword(input.newPassword, user.passwordHash)) throw badRequest('Password baru harus berbeda dari password lama');
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('Pengguna tidak ditemukan');
  await validatePasswordChange(user, input);
  
  const newHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
}
