import { apiDelete, apiGet } from "./client";

function unwrapCollection(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
}

export function getAllUsers() {
    return apiGet("/api/users").then(unwrapCollection);
}

export function getUserById(userId) {
    return apiGet(`/api/users/${userId}`);
}

export function getUserByUsername(username) {
    return apiGet(`/api/users/username/${encodeURIComponent(username)}`);
}

export function deleteUser(userId) {
    return apiDelete(`/api/users/${userId}`);
}