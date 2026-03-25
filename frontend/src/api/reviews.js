import { apiDelete, apiGet, apiPost, apiPut } from "./client";

export function getAllReviews() {
    return apiGet("/api/reviews");
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
    return apiGet("/api/reviews/my-reviews");
}

export function createReview(data) {
    return apiPost("/api/reviews", data);
}

export function updateReview(reviewId, data) {
    return apiPut(`/api/reviews/${reviewId}`, data);
}

export function deleteReview(reviewId) {
    return apiDelete(`/api/reviews/${reviewId}`);
}