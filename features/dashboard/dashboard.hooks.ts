"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  apiGetTodayAttendance,
  apiGetMyTasks,
  apiGetMyNotifications,
  apiGetMyReports,
  apiMarkNotificationRead,
} from "./dashboard.api";
import { apiGetMyInternRecord } from "@/features/interns/interns.api";
import { apiGetInternSummary } from "@/features/interns/interns.api";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const INTERN_ME_KEY       = ["intern", "me"] as const;
export const SUMMARY_KEY         = (id: string) => ["intern", id, "summary"] as const;
export const TODAY_ATTENDANCE_KEY = ["attendance", "today"] as const;
export const MY_TASKS_KEY        = (status?: string) => ["tasks", "mine", status] as const;
export const MY_NOTIFICATIONS_KEY = (read?: boolean) => ["notifications", "mine", read] as const;
export const MY_REPORTS_KEY      = (status?: string) => ["reports", "mine", status] as const;

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Own intern record — supervisor, department, dates */
export function useMyInternRecord() {
  return useQuery({
    queryKey: INTERN_ME_KEY,
    queryFn: apiGetMyInternRecord,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** Aggregated summary — tasks, attendance, evaluations, documents */
export function useInternSummary(internId?: string) {
  return useQuery({
    queryKey: SUMMARY_KEY(internId ?? ""),
    queryFn: () => apiGetInternSummary(internId!),
    enabled: !!internId,
    staleTime: 2 * 60 * 1000,
  });
}

/** Today's check-in / check-out records */
export function useTodayAttendance() {
  return useQuery({
    queryKey: TODAY_ATTENDANCE_KEY,
    queryFn: apiGetTodayAttendance,
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // poll every 2 min while page open
  });
}

/** Active / pending tasks */
export function useMyTasks(status?: string) {
  return useQuery({
    queryKey: MY_TASKS_KEY(status),
    queryFn: () => apiGetMyTasks({ status: status as any, limit: 10 }),
    staleTime: 60 * 1000,
  });
}

/** Unread notification count + recent list */
export function useMyNotifications(read?: boolean) {
  return useQuery({
    queryKey: MY_NOTIFICATIONS_KEY(read),
    queryFn: () => apiGetMyNotifications({ read, limit: 20 }),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/** Recent reports */
export function useMyReports(status?: string) {
  return useQuery({
    queryKey: MY_REPORTS_KEY(status),
    queryFn: () => apiGetMyReports({ status, limit: 5 }),
    staleTime: 60 * 1000,
  });
}

/** Mark a single notification as read */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMarkNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
