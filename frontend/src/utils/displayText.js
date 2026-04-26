const ROOM_TYPE_LABELS = {
    SINGLE: "Egyágyas",
    DOUBLE: "Kétágyas",
    TRIPLE: "Háromágyas",
    SUITE: "Lakosztály",
    PENTHOUSE: "Penthouse",
};

const ROOM_STATUS_LABELS = {
    AVAILABLE: "Elérhető",
    BOOKED: "Foglalt",
    MAINTENANCE: "Karbantartás alatt",
};

const BOOKING_STATUS_LABELS = {
    PENDING: "Függőben",
    CONFIRMED: "Megerősítve",
    CANCELLED: "Lemondva",
};

const ROLE_LABELS = {
    ADMIN: "Adminisztrátor",
    USER: "Felhasználó",
};

function translateEnum(value, map) {
    const normalized = String(value ?? "").trim().toUpperCase();
    if (!normalized) return "—";
    return map[normalized] ?? String(value);
}

export function translateRoomType(value) {
    return translateEnum(value, ROOM_TYPE_LABELS);
}

export function translateRoomStatus(value) {
    return translateEnum(value, ROOM_STATUS_LABELS);
}

export function translateBookingStatus(value) {
    return translateEnum(value, BOOKING_STATUS_LABELS);
}

export function translateRole(value) {
    return translateEnum(value, ROLE_LABELS);
}
