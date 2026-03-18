import { apiClient } from "./client";

/**
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<AuthResponse>}
 */
export function login(credentials) {
    return apiClient.post("/api/auth/login", credentials);
}

/**
 * @param {{ username: string, email: string, phone: string, password: string }} data
 * @returns {Promise<AuthResponse>}
 */
export function register(data) {
    return apiClient.post("/api/auth/register", data);
}
