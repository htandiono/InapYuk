import type { PaginationQuery } from './api';
import type { NotificationType } from './enums';

/** Owner: Feature 2 (htandiono). */

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  bookingId: string | null;
  orderNumber: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListQuery extends PaginationQuery {}

export interface UnreadCountDto {
  unreadCount: number;
}
