/**
 * Global shared types for the Whippe Intern PWA.
 *
 * Domain-specific types live alongside their feature modules (added in later phases).
 * Only put types here when they are genuinely cross-cutting.
 */

// ---------------------------------------------------------------------------
// Auth / Account
// ---------------------------------------------------------------------------

export type AccountStatus =
  | "pending_hr_verification"
  | "active"
  | "rejected"
  | "expired";

// ---------------------------------------------------------------------------
// API responses
// ---------------------------------------------------------------------------

export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Common UI state
// ---------------------------------------------------------------------------

export type LoadingState = "idle" | "loading" | "success" | "error";
