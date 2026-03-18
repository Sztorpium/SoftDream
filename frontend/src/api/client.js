/**
 * Central API client.
 *
 * Reads VITE_API_BASE_URL from the environment (default: http://localhost:8080).
 * Automatically attaches the JWT Bearer token stored in localStorage under the
 * key "softdream_token", parses JSON responses and normalises errors into a
 * shape of { status, message }.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('softdream_token');
}

function buildHeaders(extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson && (body.message ?? body.error)) ||
      `HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return body;
}

export async function apiGet(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(),
  });
  return handleResponse(response);
}

export async function apiPost(path, data) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function apiPut(path, data) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function apiPatch(path, data) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  return handleResponse(response);
}

export async function apiDelete(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  return handleResponse(response);
}
