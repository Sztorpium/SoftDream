import { apiPost } from "./client";

/**
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ token: string, type: string, userId: number, username: string, email: string, role: string }>}
 */
export function login(credentials) {
    return apiPost("/api/auth/login", credentials);
}

/**
 * @param {{ username: string, email: string, phone?: string, password: string }} data
 * @returns {Promise<{ token: string, type: string, userId: number, username: string, email: string, role: string }>}
 */
export function register(data) {
    return apiPost("/api/auth/register", data);
}