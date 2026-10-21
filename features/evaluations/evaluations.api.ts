import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, ApiPaginatedResponse } from "@/types";

export type EvaluationStatus = "DRAFT" | "SUBMITTED";

export interface EvaluationScores {
  workQuality: number;       // 1–5
  reliability: number;       // 1–5
  communication: number;     // 1–5
  learningProgress: number;  // 1–5
  professionalism: number;   // 1–5
}

export interface Evaluation {
  _id: string;
  intern: { _id: string; firstName: string; lastName: string } | string;
  supervisor: { _id: string; firstName: string; lastName: string } | string;
  status: EvaluationStatus;
  scores: EvaluationScores;
  comments: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function apiGetMyEvaluations(params?: { page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.page)  q.set("page",  String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const res = await api.get<ApiPaginatedResponse<Evaluation>>(
    `/api/v1/evaluations?${q.toString()}`,
    { headers: authHeaders() },
  );
  return res;
}

export async function apiGetEvaluationById(id: string) {
  const res = await api.get<ApiResponse<{ evaluation: Evaluation }>>(
    `/api/v1/evaluations/${id}`,
    { headers: authHeaders() },
  );
  return res.data.evaluation;
}
