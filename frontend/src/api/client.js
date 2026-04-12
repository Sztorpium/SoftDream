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

function parseErrorBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { message: null, fields: null };
    }

    const directMessage =
        body?.message ??
        body?.error ??
        (Array.isArray(body?.errors) ? body.errors.join(", ") : null);

    if (typeof directMessage === "string" && directMessage.trim() !== "") {
        return { message: directMessage, fields: null };
    }

    const fields = {};
    for (const [key, value] of Object.entries(body)) {
        if (typeof value === "string" && value.trim() !== "") {
            fields[key] = value;
        }
    }

    const fieldMessages = Object.values(fields);
    if (fieldMessages.length > 0) {
        return {
            message: fieldMessages.join(" "),
            fields,
        };
    }

    return { message: null, fields: null };
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

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
        let message = response.statusText;
        let fieldErrors = null;

        try {
            if (isJson) {
                const body = await response.json();
                const parsed = parseErrorBody(body);
                message = parsed.message ?? message;
                fieldErrors = parsed.fields;
            } else {
                const text = await response.text();
                if (text) message = text;
            }
        } catch {
            // keep message
        }

        const error = new Error(message || `HTTP ${response.status}`);
        error.status = response.status;
        if (fieldErrors) {
            error.fields = fieldErrors;
        }
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