import { apiDelete, apiGet } from "./client";

export function getAllUsers() {
    return apiGet("/api/users");
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