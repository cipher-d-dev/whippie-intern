"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, ChevronRight, Clock, CheckCircle2, Send } from "lucide-react";
import { useMyReports } from "@/features/reports/reports.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Report } from "@/features/reports/reports.api";
import type { ReportStatus } from "@/types";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value: ReportStatus | undefined }[] = [
  { label: "All",       value: undefined },
  { label: "Drafts",    value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Reviewed",  value: "REVIEWED" },
];

const STATUS_CFG: Record<ReportStatus, {
  label: string;
  variant: "default" | "secondary" | "warning" | "success";
  icon: React.ElementType;
}> = {
  DRAFT:     { label: "Draft",     variant: "secondary", icon: FileText },
  SUBMITTED: { label: "Submitted", variant: "default",   icon: Send },
  REVIEWED:  { label: "Reviewed",  variant: "success",   icon: CheckCircle2 },
};

export function ReportsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<ReportStatus | undefined>(undefined);
  const { data, isLoading } = useMyReports(activeFilter);
  const reports = data?.data ?? [];

  return (
    <div className="flex flex-col pb-4">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground animate-fade-up">
            Reports
          </h1>
          <Button
            size="sm"
            className="gap-1.5 animate-scale-in"
            onClick={() => router.push("/reports/new")}
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>

        {/* Filter pills */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                activeFilter === f.value
                  ? "bg-primary text-primary-foreground shadow-violet-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4 space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : reports.length === 0
          ? <EmptyState />
          : reports.map((report, i) => (
              <ReportCard
                key={report.id}
                report={report}
                index={i}
                onClick={() => router.push(`/reports/${report.id}`)}
              />
            ))}
      </div>
    </div>
  );
}

function ReportCard({ report, index, onClick }: { report: Report; index: number; onClick: () => void }) {
  const cfg  = STATUS_CFG[report.status];
  const Icon = cfg.icon;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border/60 bg-card p-4 shadow-card hover-lift hover-press animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className={cn(
          "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl",
          report.status === "DRAFT"     && "bg-muted",
          report.status === "SUBMITTED" && "bg-primary/10",
          report.status === "REVIEWED"  && "bg-emerald-50 dark:bg-emerald-900/20",
        )}>
          <Icon className={cn(
            "h-4 w-4",
            report.status === "DRAFT"     && "text-muted-foreground",
            report.status === "SUBMITTED" && "text-primary",
            report.status === "REVIEWED"  && "text-emerald-500",
          )} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-foreground leading-snug line-clamp-1">{report.title}</p>
            <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant={cfg.variant} className="text-[10px]">
              {report.type === "DAILY" ? "Daily" : "Weekly"} · {cfg.label}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(report.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          </div>

          {report.feedback && report.status === "REVIEWED" && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1 italic">
              "{report.feedback}"
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted animate-float">
        <FileText className="h-7 w-7 text-muted-foreground" />
      </span>
      <p className="text-sm font-medium text-foreground">No reports yet</p>
      <p className="mt-1 text-xs text-muted-foreground mb-4">
        Write your first daily or weekly report.
      </p>
      <Button size="sm" className="gap-1.5" onClick={() => router.push("/reports/new")}>
        <Plus className="h-3.5 w-3.5" />
        Write a report
      </Button>
    </div>
  );
}
