import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, ApiPaginatedResponse, ReportType, ReportStatus } from "@/types";

// ─── Shapes ───────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  content: string;
  status: ReportStatus;
  feedback?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportPayload {
  type: ReportType;
  title: string;
  content: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface UpdateReportPayload {
  title?: string;
  content?: string;
  periodStart?: string;
  periodEnd?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function apiGetMyReports(params?: { status?: string; page?: number; limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.page)   sp.set("page",   String(params.page));
  if (params?.limit)  sp.set("limit",  String(params.limit));

  const res = await api.get<ApiPaginatedResponse<Report>>(
    `/api/v1/reports?${sp.toString()}`,
    { headers: authHeaders() }
  );
  return res;
}

export async function apiGetReport(id: string) {
  const res = await api.get<ApiResponse<{ report: Report }>>(
    `/api/v1/reports/${id}`,
    { headers: authHeaders() }
  );
  return res.data.report;
}

export async function apiCreateReport(payload: CreateReportPayload) {
  const res = await api.post<ApiResponse<{ report: Report }>>(
    "/api/v1/reports",
    payload,
    { headers: authHeaders() }
  );
  return res.data.report;
}

export async function apiUpdateReport(id: string, payload: UpdateReportPayload) {
  const res = await api.patch<ApiResponse<{ report: Report }>>(
    `/api/v1/reports/${id}`,
    payload,
    { headers: authHeaders() }
  );
  return res.data.report;
}

export async function apiSubmitReport(id: string) {
  const res = await api.post<ApiResponse<{ report: Report }>>(
    `/api/v1/reports/${id}/submit`,
    undefined,
    { headers: authHeaders() }
  );
  return res.data.report;
}
