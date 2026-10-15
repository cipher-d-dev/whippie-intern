import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse } from "@/types";
import type { InternRecord } from "@/features/interns/interns.api";

export interface UpdateProfilePayload {
  phone?: string;
  address?: string;
  institution?: string;
  course?: string;
  level?: string;
}

export async function apiUpdateMyProfile(internId: string, payload: UpdateProfilePayload) {
  const res = await api.patch<ApiResponse<{ intern: InternRecord }>>(
    `/api/v1/interns/${internId}`,
    payload,
    { headers: authHeaders() }
  );
  return res.data.intern;
}
