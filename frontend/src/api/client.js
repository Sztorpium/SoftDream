const DEFAULT_BASE_URL = "http://localhost:8080";

function getBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
}

function readAuth() {
    try {
        const raw = localStorage.getItem("softdream_auth");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getToken() {
    const auth = readAuth();
    return auth?.token ?? null;
}

async function request(path, options = {}) {
    const baseUrl = getBaseUrl();
    const token = getToken();

    const headers = {
        ...(options.headers ?? {}),
    };

    if (options.body !== undefined && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
    });

    // 204 No Content
    if (response.status === 204) {
        return null;
    }

    // 401 Unauthorized – token expired or invalid; notify the app to log out
    if (response.status === 401) {
        window.dispatchEvent(new Event("auth:unauthorized"));
        const error = new Error("Munkamenete lejárt. Kérem, jelentkezzen be újra.");
        error.status = 401;
        throw error;
    }

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
        let message = response.statusText;

        try {
            if (isJson) {
                const body = await response.json();
                message =
                    body?.message ??
                    body?.error ??
                    (Array.isArray(body?.errors) ? body.errors.join(", ") : null) ??
                    message;
            } else {
                const text = await response.text();
                if (text) message = text;
            }
        } catch {
            // keep message
        }

        const error = new Error(message || `HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }

    if (!isJson) return null;
    return response.json();
}

export function apiGet(path) {
    return request(path, { method: "GET" });
}

export function apiPost(path, data) {
    return request(path, { method: "POST", body: JSON.stringify(data ?? {}) });
}

export function apiPut(path, data) {
    return request(path, { method: "PUT", body: JSON.stringify(data ?? {}) });
}

export function apiPatch(path, data) {
    return request(path, { method: "PATCH", body: JSON.stringify(data ?? {}) });
}

export function apiDelete(path) {
    return request(path, { method: "DELETE" });
}