"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse } from "@/types";
import type { FaceCaptureResult } from "@/components/face/FaceCapture";

export type FaceStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface MyFace {
  status: FaceStatus;
  /** HR has face check switched on */
  required: boolean;
  submittedAt?: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export const FACE_KEY = ["face", "me"] as const;

export function useMyFace() {
  return useQuery({
    queryKey: FACE_KEY,
    queryFn: async () => {
      try {
        return (await api.get<ApiResponse<{ face: MyFace }>>("/api/v1/face/me", { headers: authHeaders() })).data.face;
      } catch (err) {
        // Older API without face check: behave as if it's off.
        if (err instanceof ApiError && err.status === 404) return { status: "NONE", required: false } as MyFace;
        throw err;
      }
    },
    staleTime: 60 * 1000,
  });
}

export function useSendFace(onSent?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: FaceCaptureResult) =>
      (await api.post<ApiResponse<{ face: MyFace }>>("/api/v1/face/me", { ...r, consent: true }, { headers: authHeaders() })).data.face,
    onSuccess: (face) => {
      qc.setQueryData(FACE_KEY, (old: MyFace | undefined) => ({ ...(old ?? { required: true }), ...face }));
      toast.success("Sent to HR. You can check in while they review it.");
      onSent?.();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't send your photo. Try again."),
  });
}

/** Does this intern need to (re)take their face photo before checking in? */
export function needsFacePhoto(face?: MyFace) {
  return !!face?.required && (face.status === "NONE" || face.status === "REJECTED");
}
