import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse } from "@/types";
import type { InternRecord } from "@/features/interns/interns.api";

/** The details interns and corps members fill in themselves (the API allows exactly these). */
export interface UpdateProfilePayload {
  middleName?: string;
  gender?: "MALE" | "FEMALE";
  phone?: string;
  address?: string;
  institution?: string;
  institutionLocation?: string;
  course?: string;
  level?: string;
  stateCode?: string;
  callUpNumber?: string;
}

export async function apiUpdateMyProfile(internId: string, payload: UpdateProfilePayload) {
  const res = await api.patch<ApiResponse<{ intern: InternRecord }>>(
    `/api/v1/interns/${internId}`,
    payload,
    { headers: authHeaders() }
  );
  return res.data.intern;
}

export interface UploadInfo {
  endpoint: string;
  projectId: string;
  bucketId: string;
  fileId: string;
}

export async function apiGetAvatarUploadInfo(): Promise<UploadInfo> {
  const res = await api.get<ApiResponse<{ uploadInfo: UploadInfo }>>(
    "/api/v1/users/me/avatar-upload-info",
    { headers: authHeaders() }
  );
  return res.data.uploadInfo;
}

export async function apiUpdateAvatar(avatarUrl: string) {
  const res = await api.patch<ApiResponse<{ user: unknown }>>(
    "/api/v1/users/me/avatar",
    { avatarUrl },
    { headers: authHeaders() }
  );
  return res.data.user;
}