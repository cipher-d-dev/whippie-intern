"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types";

/** Wording HR sets on the staff portal's Configuration page. */
export interface AppSettings {
  labels: { INTERNSHIP: string; NYSC_IT: string };
  stations: string[];
}

const DEFAULTS: AppSettings = {
  labels: { INTERNSHIP: "Intern", NYSC_IT: "Corps member" },
  stations: ["AIT", "Raypower", "Faaji", "DAAR Corporate"],
};

export function useSettings() {
  const q = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await api.get<ApiResponse<{ settings: AppSettings }>>("/api/v1/settings")).data.settings,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
  return q.data ?? DEFAULTS;
}

/** "Intern" or "Corps member", as HR has named them. */
export function useTypeLabel() {
  const settings = useSettings();
  return useCallback(
    (type?: string | null) => (type === "NYSC_IT" ? settings.labels.NYSC_IT : settings.labels.INTERNSHIP),
    [settings],
  );
}
