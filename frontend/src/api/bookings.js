/**
 * Bookings API module.
 *
 * All endpoints require a valid JWT Bearer token unless noted.
 *
 * GET  /api/bookings                      → List<BookingResponse>  [ADMIN]
 * GET  /api/bookings/my-bookings          → List<BookingResponse>  [auth]
 * GET  /api/bookings/{bookingId}          → BookingResponse        [auth]
 * GET  /api/bookings/user/{userId}        → List<BookingResponse>  [ADMIN]
 * GET  /api/bookings/room/{roomId}        → List<BookingResponse>  [auth]
 * GET  /api/bookings/status/{status}      → List<BookingResponse>  [ADMIN]
 * POST /api/bookings                      → BookingResponse        [auth]
 * PATCH /api/bookings/{bookingId}/confirm → BookingResponse        [ADMIN]
 * PATCH /api/bookings/{bookingId}/cancel  → BookingResponse        [auth]
 * DELETE /api/bookings/{bookingId}        → void                   [ADMIN]
 *
 * BookingResponse shape:
 *   { bookingId, userId, username, roomId, roomNumber,
 *     checkIn, checkOut, status, createdAt }
 */

import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export function getAllBookings() {
  return apiGet('/api/bookings');
}

export function getMyBookings() {
  return apiGet('/api/bookings/my-bookings');
}

export function getBookingById(bookingId) {
  return apiGet(`/api/bookings/${bookingId}`);
}

export function getBookingsByUserId(userId) {
  return apiGet(`/api/bookings/user/${userId}`);
}

export function getBookingsByRoomId(roomId) {
  return apiGet(`/api/bookings/room/${roomId}`);
}

export function getBookingsByStatus(status) {
  return apiGet(`/api/bookings/status/${status}`);
}

/**
 * @param {{ roomId: number, checkIn: string, checkOut: string }} data
 */
export function createBooking(data) {
  return apiPost('/api/bookings', data);
}

export function confirmBooking(bookingId) {
  return apiPatch(`/api/bookings/${bookingId}/confirm`);
}

export function cancelBooking(bookingId) {
  return apiPatch(`/api/bookings/${bookingId}/cancel`);
}

export function deleteBooking(bookingId) {
  return apiDelete(`/api/bookings/${bookingId}`);
}
