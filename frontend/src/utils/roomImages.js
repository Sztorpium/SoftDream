// Curated Unsplash hotel-room photos used as room card imagery.
// Each entry is a direct Unsplash CDN URL (no API key required).
const ROOM_IMAGES = [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&h=500&fit=crop&auto=format&q=80",
    "https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800&h=500&fit=crop&auto=format&q=80",
];

/**
 * Returns a deterministic hotel-room image URL for the given room ID.
 * Falls back to a default image when no ID is provided.
 *
 * @param {number|string|null|undefined} roomId
 * @returns {string}
 */
export function getRoomImage(roomId) {
    const idx = roomId != null
        ? Math.abs(Number(roomId)) % ROOM_IMAGES.length
        : 0;
    return ROOM_IMAGES[idx];
}
