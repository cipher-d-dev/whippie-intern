"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGetMyEvaluations, apiGetEvaluationById } from "./evaluations.api";

export const EVALUATIONS_KEY = (page?: number) =>
  ["evaluations", "mine", page] as const;

export const EVALUATION_DETAIL_KEY = (id: string) =>
  ["evaluations", "detail", id] as const;

export function useMyEvaluations(page = 1) {
  return useQuery({
    queryKey: EVALUATIONS_KEY(page),
    queryFn: () => apiGetMyEvaluations({ page, limit: 20 }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useEvaluationDetail(id?: string) {
  return useQuery({
    queryKey: EVALUATION_DETAIL_KEY(id ?? ""),
    queryFn: () => apiGetEvaluationById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
