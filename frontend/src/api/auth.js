/**
 * Auth API module.
 *
 * POST /api/auth/login    – { username, password } → AuthResponse
 * POST /api/auth/register – { username, email, phone, password } → AuthResponse
 *
 * AuthResponse shape:
 *   { token, type, userId, username, email, role }
 */

import { apiPost } from './client';

/**
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<AuthResponse>}
 */
export function login(credentials) {
  return apiPost('/api/auth/login', credentials);
}

/**
 * @param {{ username: string, email: string, phone: string, password: string }} data
 * @returns {Promise<AuthResponse>}
 */
export function register(data) {
  return apiPost('/api/auth/register', data);
}
