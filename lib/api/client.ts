/**
 * API client stub — Phase 1 will flesh this out with real request logic,
 * session handling (HTTP-only cookies) and error normalisation.
 *
 * All API calls go through the shared Express backend.
 * The client NEVER connects directly to MongoDB.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiErrorBody = {
  message: string;
  code?: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody
  ) {
    super(body.message);
    this.name = "ApiError";
  }
}

/**
 * Base fetch wrapper — will be extended in Phase 1 with:
 * - credentials: "include" for cookie-based sessions
 * - CSRF token handling if required
 * - response type normalisation
 * - centralised error handling
 */
async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    // Phase 1: change to "include" once session cookies are established
    credentials: "same-origin",
  });

  if (!response.ok) {
    let body: ApiErrorBody = { message: response.statusText };
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // ignore JSON parse failure — use statusText
    }
    throw new ApiError(response.status, body);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
