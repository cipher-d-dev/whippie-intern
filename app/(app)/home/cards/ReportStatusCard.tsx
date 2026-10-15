"use client";

import { FileEdit, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReportItem } from "@/features/dashboard/dashboard.api";
import { cn } from "@/lib/utils";

interface Props {
  drafts: ReportItem[];
  className?: string;
}

export function ReportStatusCard({ drafts, className }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/reports")}
      className={cn(
        "w-full text-left rounded-2xl border border-amber-200/60 bg-amber-50 p-4",
        "dark:border-amber-800/30 dark:bg-amber-900/15",
        "hover-lift hover-press",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 animate-icon-pop">
            <FileEdit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {drafts.length} draft {drafts.length === 1 ? "report" : "reports"} pending
            </p>
            <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
              Submit before your supervisor&apos;s review
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      </div>
    </button>
  );
}
