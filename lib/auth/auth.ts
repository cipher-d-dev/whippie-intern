/**
 * Auth utilities stub — Phase 1 will implement:
 * - session checking (GET /auth/me)
 * - login / logout
 * - Google OAuth redirect
 * - session expiry handling
 *
 * Authentication uses HTTP-only cookies managed by the Express backend.
 * No sensitive auth material is stored in client-side JS or localStorage.
 */

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "pending_verification"
  | "active"
  | "rejected";

/**
 * Placeholder — replaced in Phase 1 with a real useSession hook backed by
 * GET /auth/me and TanStack Query.
 */
export function getAuthRedirectPath(status: AuthStatus): string | null {
  switch (status) {
    case "unauthenticated":
      return "/login";
    case "pending_verification":
      return "/verification-pending";
    case "rejected":
      return "/account-rejected";
    case "active":
      return null; // no redirect needed
    case "loading":
      return null;
  }
}
