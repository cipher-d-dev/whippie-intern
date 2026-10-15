"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGetNotifications, apiMarkRead, apiMarkAllRead } from "./notifications.api";

export const NOTIFS_KEY = (page: number, read?: boolean) =>
  ["notifications", page, read ?? "all"] as const;

export const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

export function useNotifications(page = 1, read?: boolean) {
  return useQuery({
    queryKey: NOTIFS_KEY(page, read),
    queryFn:  () => apiGetNotifications({ page, limit: 20, read }),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn:  async () => {
      const res = await apiGetNotifications({ read: false, limit: 1 });
      return res.total;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMarkRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiMarkAllRead(),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      if (res.count > 0) toast.success(`${res.count} notification${res.count > 1 ? "s" : ""} marked as read`);
    },
  });
}
