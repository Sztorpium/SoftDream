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


/**
 * Invalidates the current JWT token on the server side.
 * @returns {Promise<null>}
 */
export function logout() {
    return apiPost("/api/auth/logout", {});
}