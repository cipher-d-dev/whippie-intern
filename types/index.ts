/**
 * Global shared types for the Whippe Intern PWA.
 * Domain-specific types live alongside their feature modules.
 * Only put types here when they are genuinely cross-cutting.
 */

// ─── Enums (match API contract exactly) ──────────────────────────────────────

export type status =
  | "UNVERIFIED_EMAIL"
  | "PENDING_HR_VERIFICATION"
  | "ACTIVE"
  | "REJECTED";

export type Role = "HR" | "SUPERVISOR" | "INTERN";

export type AuthMethod = "PASSWORD" | "GOOGLE" | "BOTH";

export type InternshipType = "INTERNSHIP" | "NYSC_IT";

export type InternshipStatus =
  | "SCREENED"
  | "ONBOARDING"
  | "ACTIVE"
  | "COMPLETED";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "COMPLETED";

export type SubmissionStatus =
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED";

export type ReportType = "DAILY" | "WEEKLY";

export type ReportStatus = "DRAFT" | "SUBMITTED" | "REVIEWED";

export type EvaluationStatus = "DRAFT" | "SUBMITTED";

export type AttendanceStatus = "ACCEPTED" | "FLAGGED" | "REJECTED" | "CORRECTED";

export type CheckType = "CHECK_IN" | "CHECK_OUT";

export type NotificationType =
  | "ACCOUNT_APPROVED"
  | "ACCOUNT_REJECTED"
  | "SUPERVISOR_ASSIGNED"
  | "TASK_ASSIGNED"
  | "TASK_FEEDBACK"
  | "SUBMISSION_APPROVED"
  | "SUBMISSION_CHANGES_REQUESTED"
  | "EVALUATION_SUBMITTED"
  | "DOCUMENT_STATUS_CHANGED"
  | "REPORT_REVIEWED";

// ─── Domain objects ───────────────────────────────────────────────────────────

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: status;        // API field is "status" not "status"
  authMethod: AuthMethod;
  createdAt: string;
  updatedAt: string;
}

export interface InternProfile {
  _id: string;
  userId: string | User;
  type: InternshipType;
  status: InternshipStatus;
  department?: string | { _id: string; name: string };
  supervisor?: string | { _id: string; firstName: string; lastName: string };
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API envelope ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Common UI state ──────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";
