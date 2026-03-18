import { apiClient } from "./client";

export function getAllBookings() {
    return apiClient.get("/api/bookings");
}

export function getMyBookings() {
    return apiClient.get("/api/bookings/my-bookings");
}

export function getBookingById(bookingId) {
    return apiClient.get(`/api/bookings/${bookingId}`);
}

export function getBookingsByUser(userId) {
    return apiClient.get(`/api/bookings/user/${userId}`);
}

export function getBookingsByRoom(roomId) {
    return apiClient.get(`/api/bookings/room/${roomId}`);
}

export function getBookingsByStatus(status) {
    return apiClient.get(`/api/bookings/status/${status}`);
}

export function createBooking(bookingRequest) {
    return apiClient.post("/api/bookings", bookingRequest);
}

export function confirmBooking(bookingId) {
    return apiClient.patch(`/api/bookings/${bookingId}/confirm`);
}

export function cancelBooking(bookingId) {
    return apiClient.patch(`/api/bookings/${bookingId}/cancel`);
}

export function deleteBooking(bookingId) {
    return apiClient.delete(`/api/bookings/${bookingId}`);
}
