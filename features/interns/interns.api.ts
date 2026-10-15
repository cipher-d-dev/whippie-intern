import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, InternshipType, InternshipStatus } from "@/types";

// ─── Shapes ───────────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  subsidiary?: string;
}

export interface Supervisor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface InternRecord {
  id: string;
  user: { id: string; email: string; role: string; status: string };
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  institution?: string;
  course?: string;
  level?: string;
  internshipType: InternshipType;
  status: InternshipStatus;
  startDate?: string;
  endDate?: string;
  completedAt?: string | null;
  completionNote?: string | null;
  department?: Department | null;
  supervisor?: Supervisor | null;
  createdAt: string;
  updatedAt: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function apiGetMyInternRecord() {
  const res = await api.get<ApiResponse<{ intern: InternRecord }>>(
    "/api/v1/interns/me",
    { headers: authHeaders() }
  );
  return res.data.intern;
}

export async function apiGetInternSummary(internId: string) {
  const res = await api.get<ApiResponse<{ summary: InternSummary }>>(
    `/api/v1/interns/${internId}/summary`,
    { headers: authHeaders() }
  );
  return res.data.summary;
}

// ─── Summary shape ────────────────────────────────────────────────────────────

export interface InternSummary {
  intern: {
    id: string;
    firstName: string;
    lastName: string;
    status: InternshipStatus;
    internshipType: InternshipType;
    startDate?: string;
    endDate?: string;
  };
  attendance: {
    totalCheckIns: number;
    accepted: number;
    flagged: number;
    rejected: number;
    corrected: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    changesRequested: number;
    todo: number;
    completionRate: number;
  };
  evaluations: {
    count: number;
    averageScores: {
      workQuality: number;
      reliability: number;
      communication: number;
      learningProgress: number;
      professionalism: number;
      overall: number;
    } | null;
  };
  documents: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}
