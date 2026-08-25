import type { NotificationType } from '@inapyuk/types';
import { prisma } from '../../libs/prisma';

/** Writes an in-app notice. Emails for the same events land in a later sprint. */
export async function notifyUser(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  bookingId?: string;
}): Promise<void> {
  await prisma.notification.create({ data: input });
}
