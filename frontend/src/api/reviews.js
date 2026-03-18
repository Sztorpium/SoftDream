/**
 * Reviews API module.
 *
 * GET  /api/reviews                            → List<ReviewResponse>   [public]
 * GET  /api/reviews/{reviewId}                 → ReviewResponse         [public]
 * GET  /api/reviews/room/{roomId}              → List<ReviewResponse>   [public]
 * GET  /api/reviews/room/{roomId}/average-rating → Double              [public]
 * GET  /api/reviews/my-reviews                 → List<ReviewResponse>   [auth]
 * POST /api/reviews                            → ReviewResponse         [auth]
 * PUT  /api/reviews/{reviewId}                 → ReviewResponse         [auth]
 * DELETE /api/reviews/{reviewId}               → void                   [ADMIN]
 *
 * ReviewResponse shape:
 *   { reviewId, userId, username, roomId, roomNumber,
 *     rating, comment, createdAt }
 */

import { apiDelete, apiGet, apiPost, apiPut } from './client';

export function getAllReviews() {
  return apiGet('/api/reviews');
}

export function getReviewById(reviewId) {
  return apiGet(`/api/reviews/${reviewId}`);
}

export function getReviewsByRoomId(roomId) {
  return apiGet(`/api/reviews/room/${roomId}`);
}

export function getAverageRating(roomId) {
  return apiGet(`/api/reviews/room/${roomId}/average-rating`);
}

export function getMyReviews() {
  return apiGet('/api/reviews/my-reviews');
}

/**
 * @param {{ roomId: number, rating: number, comment?: string }} data
 */
export function createReview(data) {
  return apiPost('/api/reviews', data);
}

/**
 * @param {number} reviewId
 * @param {{ roomId: number, rating: number, comment?: string }} data
 */
export function updateReview(reviewId, data) {
  return apiPut(`/api/reviews/${reviewId}`, data);
}

export function deleteReview(reviewId) {
  return apiDelete(`/api/reviews/${reviewId}`);
}
