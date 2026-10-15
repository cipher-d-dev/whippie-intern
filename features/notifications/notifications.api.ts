import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, ApiPaginatedResponse, NotificationType } from "@/types";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedEntity?: { kind: string; id: string } | null;
  createdAt: string;
}

export async function apiGetNotifications(params?: { read?: boolean; page?: number; limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.read  !== undefined) sp.set("read",  String(params.read));
  if (params?.page)  sp.set("page",  String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));

  const res = await api.get<ApiPaginatedResponse<Notification>>(
    `/api/v1/notifications?${sp.toString()}`,
    { headers: authHeaders() }
  );
  return res;
}

export async function apiMarkRead(id: string) {
  const res = await api.patch<ApiResponse<{ notification: Notification }>>(
    `/api/v1/notifications/${id}/read`,
    undefined,
    { headers: authHeaders() }
  );
  return res.data.notification;
}

export async function apiMarkAllRead() {
  const res = await api.patch<{ success: boolean; count: number }>(
    "/api/v1/notifications/read-all",
    undefined,
    { headers: authHeaders() }
  );
  return res;
}
