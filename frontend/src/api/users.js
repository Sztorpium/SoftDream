import { apiDelete, apiGet } from "./client";

export function getAllUsers({ page = 0, size = 20 } = {}) {
    return apiGet(`/api/users?page=${page}&size=${size}&sort=createdAt,desc`);
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