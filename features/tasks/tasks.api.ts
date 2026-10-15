import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, ApiPaginatedResponse, TaskStatus } from "@/types";

// ─── Shapes ───────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  intern: { id: string; firstName: string; lastName: string };
  supervisor: { id: string; firstName: string; lastName: string };
  createdBy: string;
  status: TaskStatus;
  deadline?: string | null;
  feedback?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TasksListParams {
  status?: TaskStatus;
  page?: number;
  limit?: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function apiGetMyTasks(params?: TasksListParams) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.page)   sp.set("page",   String(params.page));
  if (params?.limit)  sp.set("limit",  String(params.limit));

  const res = await api.get<ApiPaginatedResponse<Task>>(
    `/api/v1/tasks?${sp.toString()}`,
    { headers: authHeaders() }
  );
  return res;
}

export async function apiGetTask(id: string) {
  const res = await api.get<ApiResponse<{ task: Task }>>(
    `/api/v1/tasks/${id}`,
    { headers: authHeaders() }
  );
  return res.data.task;
}

export async function apiStartTask(id: string) {
  const res = await api.patch<ApiResponse<{ task: Task }>>(
    `/api/v1/tasks/${id}`,
    { status: "IN_PROGRESS" },
    { headers: authHeaders() }
  );
  return res.data.task;
}
