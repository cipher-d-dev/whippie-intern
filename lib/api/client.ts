/**
 * API client — shared fetch wrapper for the Whippe Express backend.
 * Handles session cookies, error normalisation and per-field validation errors.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/* ─── Error types ────────────────────────────────────────────────────────── */

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  message: string;
  code?: string;
  errors?: ApiFieldError[];
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody
  ) {
    super(body.message);
    this.name = "ApiError";
  }

  /** Convenience: array of field-level errors (empty if none) */
  get errors(): ApiFieldError[] {
    return this.body.errors ?? [];
  }
}

/* ─── Core request ───────────────────────────────────────────────────────── */

// Track whether a refresh is already in flight to avoid parallel refresh storms
let _refreshing: Promise<void> | null = null;

async function request<T>(path: string, options?: RequestInit, _retry = true): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    // HTTP-only session cookies are managed by Express
    credentials: "include",
  });

  if (!response.ok) {
    // On 401, attempt a silent token refresh once then retry the original request
    if (response.status === 401 && _retry && !path.includes("/auth/refresh")) {
      if (!_refreshing) {
        _refreshing = (async () => {
          try {
            // Lazy import to avoid circular dependency at module load time
            const { apiRefresh } = await import("@/features/auth/auth.api");
            await apiRefresh();
          } finally {
            _refreshing = null;
          }
        })();
      }
      try {
        await _refreshing;
        // Re-run the original request with the new token in headers
        const { authHeaders } = await import("@/features/auth/auth.api");
        const retryOptions: RequestInit = {
          ...options,
          headers: { ...options?.headers, ...authHeaders() },
        };
        return request<T>(path, retryOptions, false);
      } catch {
        // Refresh failed — fall through and throw the original 401
      }
    }

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

/* ─── Exported API object ────────────────────────────────────────────────── */

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

/* ─── Utility: apply API field errors to react-hook-form ────────────────── */

type SetErrorFn = (
  field: string,
  error: { type: string; message: string }
) => void;

/**
 * Maps an ApiError's per-field errors onto a react-hook-form `setError` fn.
 * Returns true if any field errors were applied, false if only a message.
 */
export function applyApiErrors(err: unknown, setError: SetErrorFn): boolean {
  if (!(err instanceof ApiError)) return false;
  const fieldErrors = err.errors;
  if (fieldErrors.length === 0) return false;

  for (const { field, message } of fieldErrors) {
    setError(field, { type: "server", message });
  }
  return true;
}
