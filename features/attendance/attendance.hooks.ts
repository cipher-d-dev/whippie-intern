"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiCheckIn, apiGetMyAttendance, apiGetGeofence, type CheckInPayload } from "./attendance.api";
import { ApiError } from "@/lib/api/client";

// Shared key — same as dashboard.hooks TODAY_ATTENDANCE_KEY so a check-in
// from the attendance page also invalidates the home dashboard card.
export const TODAY_KEY   = ["attendance", "today"] as const;
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

/** The office zone. Changes rarely, so it is cached for the session. */
export function useGeofence() {
  return useQuery({
    queryKey: ["attendance", "geofence"],
    queryFn: apiGetGeofence,
    staleTime: 60 * 60 * 1000,
    retry: 1,
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
          record.checkType === "CHECK_IN" ? "You're checked in" : "You're checked out"
        );
      } else if (record.status === "FLAGGED") {
        toast.warning("Recorded, but your GPS signal was weak, so HR will take a look.");
      } else {
        toast.error("Not accepted: you were outside the office zone. HR can correct it if this is wrong.");
      }
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("You've already done that today.");
        } else if (err.status === 404) {
          toast.error("HR hasn't finished setting up your record yet.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("That didn't go through. Check your connection and try again.");
      }
    },
  });
}
