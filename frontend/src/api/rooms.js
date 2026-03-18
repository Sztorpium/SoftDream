/**
 * Rooms API module.
 *
 * All endpoints are publicly accessible (no auth required).
 *
 * GET /api/rooms                          → List<RoomResponse>
 * GET /api/rooms/{roomId}                 → RoomResponse
 * GET /api/rooms/available?checkIn&checkOut → List<RoomResponse>
 * GET /api/rooms/type/{roomTypeId}        → List<RoomResponse>
 * GET /api/rooms/status/{status}          → List<RoomResponse>
 *
 * RoomResponse shape:
 *   { roomId, roomNumber, floor, status, type, basePrice,
 *     description, maxGuests, averageRating }
 */

import { apiGet } from './client';

export function getAllRooms() {
  return apiGet('/api/rooms');
}

export function getRoomById(roomId) {
  return apiGet(`/api/rooms/${roomId}`);
}

/**
 * @param {string} checkIn  – ISO date string, e.g. "2025-08-01"
 * @param {string} checkOut – ISO date string, e.g. "2025-08-07"
 */
export function getAvailableRooms(checkIn, checkOut) {
  return apiGet(`/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`);
}

export function getRoomsByType(roomTypeId) {
  return apiGet(`/api/rooms/type/${roomTypeId}`);
}

export function getRoomsByStatus(status) {
  return apiGet(`/api/rooms/status/${status}`);
}
