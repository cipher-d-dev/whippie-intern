"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiCheckIn, apiGetMyAttendance, type CheckInPayload } from "./attendance.api";
import { ApiError } from "@/lib/api/client";

// Distinct key — avoids collision with dashboard.hooks TODAY_ATTENDANCE_KEY
export const TODAY_KEY   = ["attendance", "today", "intern"] as const;
export const HISTORY_KEY = (page: number) => ["attendance", "history", page] as const;

export function useTodayAttendance() {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: TODAY_KEY,
    queryFn:  () => apiGetMyAttendance({ date: today, limit: 10 }),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    // Return empty list instead of throwing — 404 means no intern record yet
    // The screen handles this case explicitly
    retry: (failCount, err) => {
      if (err instanceof ApiError && err.status === 404) return false;
      return failCount < 2;
    },
  });
}

export function useAttendanceHistory(page = 1) {
  return useQuery({
    queryKey: HISTORY_KEY(page),
    queryFn:  () => apiGetMyAttendance({ page, limit: 20 }),
    staleTime: 2 * 60 * 1000,
    retry: (failCount, err) => {
      if (err instanceof ApiError && err.status === 404) return false;
      return failCount < 2;
    },
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckInPayload) => apiCheckIn(payload),
    onSuccess: (record) => {
      qc.invalidateQueries({ queryKey: TODAY_KEY });
      qc.invalidateQueries({ queryKey: ["attendance", "history"] });

      if (record.status === "ACCEPTED") {
        toast.success(
          record.checkType === "CHECK_IN" ? "Checked in!" : "Checked out!"
        );
      } else if (record.status === "FLAGGED") {
        toast.warning("Recorded but flagged — poor GPS accuracy. HR will review.");
      } else {
        toast.error("Check-in rejected — you appear to be outside the office.");
      }
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("Already checked in/out today.");
        } else if (err.status === 404) {
          toast.error("Your intern record hasn't been set up yet. Contact HR.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Check-in failed. Please try again.");
      }
    },
  });
}
