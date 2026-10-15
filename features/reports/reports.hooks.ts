"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiGetMyReports, apiGetReport, apiCreateReport,
  apiUpdateReport, apiSubmitReport,
  type CreateReportPayload, type UpdateReportPayload,
} from "./reports.api";

export const REPORTS_LIST_KEY  = (status?: string) => ["reports", "list", status ?? "all"] as const;
export const REPORT_KEY        = (id: string)       => ["reports", id] as const;

export function useMyReports(status?: string) {
  return useQuery({
    queryKey: REPORTS_LIST_KEY(status),
    queryFn:  () => apiGetMyReports({ status, limit: 50 }),
    staleTime: 60 * 1000,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: REPORT_KEY(id),
    queryFn:  () => apiGetReport(id),
    staleTime: 60 * 1000,
    enabled:  !!id,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => apiCreateReport(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", "list"] });
      toast.success("Report saved as draft");
    },
    onError: () => toast.error("Could not create report"),
  });
}

export function useUpdateReport(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateReportPayload) => apiUpdateReport(id, payload),
    onSuccess: (report) => {
      qc.setQueryData(REPORT_KEY(id), report);
      qc.invalidateQueries({ queryKey: ["reports", "list"] });
      toast.success("Draft saved");
    },
    onError: () => toast.error("Could not save draft"),
  });
}

export function useSubmitReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSubmitReport(id),
    onSuccess: (report) => {
      qc.setQueryData(REPORT_KEY(report.id), report);
      qc.invalidateQueries({ queryKey: ["reports", "list"] });
      toast.success("Report submitted!");
    },
    onError: (err: any) => {
      toast.error(err?.body?.message ?? "Could not submit report");
    },
  });
}
