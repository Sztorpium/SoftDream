import { apiDelete, apiGet, apiPost, apiPut } from "./client";

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

export function getMyProfile() {
    return apiGet("/api/users/me");
}

export function verifyMyPassword(password) {
    return apiPost("/api/users/me/verify-password", { password });
}

export function changeMyPassword(data) {
    return apiPut("/api/users/me/password", data);
}

export function updateMyProfile(data) {
    return apiPut("/api/users/me", data);
}

export function deleteUser(userId) {
    return apiDelete(`/api/users/${userId}`);
}