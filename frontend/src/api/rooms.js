import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export function getAllRooms({ q, type, maxPrice, sort } = {}) {
    const params = new URLSearchParams();
    if (q && q.trim()) params.set("q", q.trim());
    if (type && type !== "ALL") params.set("type", type);
    if (maxPrice != null) params.set("maxPrice", maxPrice);
    if (sort && sort !== "RECOMMENDED") params.set("sort", sort);
    const qs = params.toString();
    return apiGet(qs ? `/api/rooms?${qs}` : "/api/rooms");
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

export function createRoom(data) {
    return apiPost("/api/rooms", data);
}

export function updateRoomStatus(roomId, data) {
    return apiPatch(`/api/rooms/${roomId}/status`, data);
}

export function deleteRoom(roomId) {
    return apiDelete(`/api/rooms/${roomId}`);
}