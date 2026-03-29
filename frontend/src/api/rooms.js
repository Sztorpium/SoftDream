import { apiGet } from "./client";

export function getAllRooms() {
    return apiGet("/api/rooms");
}

export function getRoomById(roomId) {
    return apiGet(`/api/rooms/${roomId}`);
}

export function getAvailableRooms(checkIn, checkOut) {
    const params = new URLSearchParams({ checkIn, checkOut });
    return apiGet(`/api/rooms/available?${params.toString()}`);
}

export function getRoomsByType(roomTypeId) {
    return apiGet(`/api/rooms/type/${roomTypeId}`);
}

export function getRoomsByStatus(status) {
    return apiGet(`/api/rooms/status/${status}`);
}

export function getRoomBookedDates(roomId) {
    return apiGet(`/api/rooms/${roomId}/booked-dates`);
}