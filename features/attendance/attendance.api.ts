import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, ApiPaginatedResponse, AttendanceStatus, CheckType } from "@/types";

// ─── Shapes ───────────────────────────────────────────────────────────────────

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

export interface CheckInPayload {
  checkType: CheckType;
  latitude: number;
  longitude: number;
  locationAccuracy?: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function apiCheckIn(payload: CheckInPayload) {
  const res = await api.post<ApiResponse<{ attendance: AttendanceRecord }>>(
    "/api/v1/attendance/check-in",
    payload,
    { headers: authHeaders() }
  );
  return res.data.attendance;
}

export async function apiGetMyAttendance(params?: {
  date?: string;
  page?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.date)  sp.set("date",  params.date);
  if (params?.page)  sp.set("page",  String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));

  const res = await api.get<ApiPaginatedResponse<AttendanceRecord>>(
    `/api/v1/attendance?${sp.toString()}`,
    { headers: authHeaders() }
  );
  return res;
}
