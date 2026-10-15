import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiPaginatedResponse } from "@/types";

export type TimelineEventType =
  | "ATTENDANCE"
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "SUBMISSION"
  | "REPORT"
  | "EVALUATION"
  | "DOCUMENT";

export interface TimelineEvent {
  type: TimelineEventType;
  date: string;
  title: string;
  detail?: string;
  refId?: string;
  refKind?: string;
}

export async function apiGetTimeline(internId: string, params?: { page?: number; limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.page)  sp.set("page",  String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));

  const res = await api.get<ApiPaginatedResponse<TimelineEvent>>(
    `/api/v1/interns/${internId}/timeline?${sp.toString()}`,
    { headers: authHeaders() }
  );
  return res;
}
