import { config } from "../config";

/**
 * Simple wrapper that adds Authorization header when token provided.
 * returns response.json() or throws with { message, status }
 */
export async function apiFetch(path, { method = "GET", body, token, qs } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let url = `${config.API_BASE_URL}${path}`;
  if (qs) {
    const params = new URLSearchParams(qs).toString();
    url = `${url}?${params}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { raw: text };
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || res.statusText || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
