/**
 * Users API module.
 *
 * GET    /api/users                      → List<UserResponse>  [ADMIN]
 * GET    /api/users/{userId}             → UserResponse        [auth]
 * GET    /api/users/username/{username}  → UserResponse        [auth]
 * DELETE /api/users/{userId}             → void                [ADMIN]
 *
 * UserResponse shape:
 *   { userId, username, email, phone, role, createdAt }
 */

import { apiDelete, apiGet } from './client';

export function getAllUsers() {
  return apiGet('/api/users');
}

export function getUserById(userId) {
  return apiGet(`/api/users/${userId}`);
}

export function getUserByUsername(username) {
  return apiGet(`/api/users/username/${username}`);
}

export function deleteUser(userId) {
  return apiDelete(`/api/users/${userId}`);
}
