import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export function getAllBookings({ page = 0, size = 20 } = {}) {
    return apiGet(`/api/bookings?page=${page}&size=${size}&sort=createdAt,desc`);
}

export function getMyBookings() {
    return apiGet("/api/bookings/my-bookings");
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

export function createBooking(data) {
    return apiPost("/api/bookings", data);
}

export function confirmBooking(bookingId) {
    return apiPatch(`/api/bookings/${bookingId}/confirm`, {});
}

export function cancelBooking(bookingId) {
    return apiPatch(`/api/bookings/${bookingId}/cancel`, {});
}

export function deleteBooking(bookingId) {
    return apiDelete(`/api/bookings/${bookingId}`);
}