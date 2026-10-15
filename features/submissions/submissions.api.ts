import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, SubmissionStatus } from "@/types";

// ─── Shapes ───────────────────────────────────────────────────────────────────

export interface Submission {
  id: string;
  taskId: string;
  intern: { id: string; firstName: string; lastName: string };
  content: string;
  status: SubmissionStatus;
  feedback?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function apiSubmitTask(payload: { taskId: string; content: string }) {
  const res = await api.post<ApiResponse<{ submission: Submission }>>(
    "/api/v1/submissions",
    payload,
    { headers: authHeaders() }
  );
  return res.data.submission;
}

export async function apiGetTaskSubmissions(taskId: string) {
  const res = await api.get<ApiResponse<{ submissions: Submission[] }>>(
    `/api/v1/submissions/task/${taskId}`,
    { headers: authHeaders() }
  );
  return res.data.submissions;
}
