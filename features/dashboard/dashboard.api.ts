import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, ApiPaginatedResponse, TaskStatus, AttendanceStatus, CheckType, NotificationType } from "@/types";

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  intern: string;
  date: string;
  checkType: CheckType;
  status: AttendanceStatus;
  submittedAt: string;
  distanceFromOffice?: number;
  withinGeofence?: boolean;
  flagReasons?: string[];
}

export async function apiGetTodayAttendance(): Promise<AttendanceRecord[]> {
  const today = new Date().toISOString().split("T")[0];
  const res = await api.get<ApiPaginatedResponse<AttendanceRecord>>(
    `/api/v1/attendance?date=${today}&limit=10`,
    { headers: authHeaders() }
  );
  return res.data;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline?: string;
  feedback?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function apiGetMyTasks(params?: {
  status?: TaskStatus;
  limit?: number;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.limit)  sp.set("limit", String(params.limit));
  if (params?.page)   sp.set("page", String(params.page));

  const res = await api.get<ApiPaginatedResponse<TaskItem>>(
    `/api/v1/tasks?${sp.toString()}`,
    { headers: authHeaders() }
  );
  return res;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedEntity?: { kind: string; id: string } | null;
  createdAt: string;
}

export async function apiGetMyNotifications(params?: {
  read?: boolean;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.read !== undefined) sp.set("read", String(params.read));
  if (params?.limit) sp.set("limit", String(params.limit));

  const res = await api.get<ApiPaginatedResponse<NotificationItem>>(
    `/api/v1/notifications?${sp.toString()}`,
    { headers: authHeaders() }
  );
  return res;
}

export async function apiMarkNotificationRead(id: string) {
  const res = await api.patch<ApiResponse<{ notification: NotificationItem }>>(
    `/api/v1/notifications/${id}/read`,
    undefined,
    { headers: authHeaders() }
  );
  return res.data.notification;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface ReportItem {
  id: string;
  type: "DAILY" | "WEEKLY";
  title: string;
  status: "DRAFT" | "SUBMITTED" | "REVIEWED";
  feedback?: string | null;
  periodStart?: string;
  periodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export async function apiGetMyReports(params?: {
  status?: string;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.limit)  sp.set("limit", String(params.limit));

  const res = await api.get<ApiPaginatedResponse<ReportItem>>(
    `/api/v1/reports?${sp.toString()}`,
    { headers: authHeaders() }
  );
  return res;
}
