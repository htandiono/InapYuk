import type { CreateReviewRequest, ReplyReviewRequest, ReviewListQuery } from '@inapyuk/types';
import { asyncHandler } from '../../utils/async-handler';
import { sendCreated, sendSuccess } from '../../utils/api-response';
import { unauthorized } from '../../utils/app-error';
import { createReview } from './reviews.create';
import { listPropertyReviews, listTenantReviews } from './reviews.list';
import { replyToReview } from './reviews.reply';

export const postReview = asyncHandler(async (req, res) => {
  if (!req.user) throw unauthorized();
  const review = await createReview(req.user, req.body as CreateReviewRequest);
  sendCreated(res, review, 'Ulasan tersimpan. Terima kasih!');
});

export const getPropertyReviews = asyncHandler(async (req, res) => {
  const data = await listPropertyReviews(
    String(req.params.propertyId),
    req.query as ReviewListQuery,
  );
  sendSuccess(res, data, 'Ulasan properti');
});

export const getTenantReviews = asyncHandler(async (req, res) => {
  if (!req.tenantId) throw unauthorized();
  const data = await listTenantReviews(req.tenantId, req.query as ReviewListQuery);
  sendSuccess(res, data, 'Ulasan properti kamu');
});

export const postTenantReply = asyncHandler(async (req, res) => {
  if (!req.tenantId) throw unauthorized();
  const body = req.body as ReplyReviewRequest;
  const review = await replyToReview(req.tenantId, String(req.params.id), body.comment);
  sendSuccess(res, review, 'Balasan tersimpan');
});
