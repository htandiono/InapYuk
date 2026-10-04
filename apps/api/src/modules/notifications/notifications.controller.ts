import type { NotificationListQuery } from '@inapyuk/types';
import { asyncHandler } from '../../utils/async-handler';
import { sendPaginated, sendSuccess } from '../../utils/api-response';
import { unauthorized } from '../../utils/app-error';
import {
  listNotifications,
  markAllRead,
  markOneRead,
  unreadCount,
} from './notifications.service';

export const listMine = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const result = await listNotifications(req.user.sub, req.query as NotificationListQuery);
  sendPaginated(res, result.items, result.meta, 'Notifikasi kamu');
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const data = await unreadCount(req.user.sub);
  sendSuccess(res, data, 'Jumlah belum dibaca');
});

export const readOne = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  await markOneRead(req.user.sub, String(req.params.id));
  sendSuccess(res, { read: true }, 'Notifikasi ditandai sudah dibaca');
});

export const readAll = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  await markAllRead(req.user.sub);
  sendSuccess(res, { read: true }, 'Semua notifikasi ditandai sudah dibaca');
});
