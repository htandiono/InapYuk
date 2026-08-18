import type { PaginationQuery } from './api';

/** Owner: Feature 2 (htandiono). */

export interface ReviewReplyDto {
  id: string;
  comment: string;
  createdAt: string;
  tenantName: string;
}

export interface ReviewDto {
  id: string;
  bookingId: string;
  propertyId: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  reply: ReviewReplyDto | null;
}

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface ReplyReviewRequest {
  comment: string;
}

export interface ReviewListQuery extends PaginationQuery {
  propertyId?: string;
  hasReply?: boolean;
}
