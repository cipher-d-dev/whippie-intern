"use client";

import { useSearchParams } from "next/navigation";
import { ReportEditor } from "@/features/reports/components/ReportEditor";

export function NewReportScreen() {
  const params = useSearchParams();
  const type = params.get("type") === "DAILY" ? "DAILY" : "WEEKLY";
  return <ReportEditor initialType={type} />;
}
