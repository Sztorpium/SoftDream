const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function getToken() {
    return localStorage.getItem("token");
}

async function request(path, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let message;
        try {
            const body = await response.json();
            message =
                body?.message ??
                (Array.isArray(body?.errors) ? body.errors.join(", ") : null) ??
                response.statusText;
        } catch {
            message = response.statusText;
        }
        const error = new Error(message || `HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return null;
}

export const apiClient = {
    get: (path, options) => request(path, { method: "GET", ...options }),
    post: (path, body, options) =>
        request(path, { method: "POST", body: JSON.stringify(body), ...options }),
    put: (path, body, options) =>
        request(path, { method: "PUT", body: JSON.stringify(body), ...options }),
    patch: (path, body, options) =>
        request(path, { method: "PATCH", body: JSON.stringify(body), ...options }),
    delete: (path, options) => request(path, { method: "DELETE", ...options }),
};
