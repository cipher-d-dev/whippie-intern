"use client";

import { TrendingUp, CalendarDays, Star } from "lucide-react";
import type { InternRecord } from "@/features/interns/interns.api";
import type { InternSummary } from "@/features/interns/interns.api";
import { cn } from "@/lib/utils";

interface Props {
  intern: InternRecord;
  summary: InternSummary;
  className?: string;
}

export function ProgressCard({ intern, summary, className }: Props) {
  const { startDate, endDate } = intern;
  const start = startDate ? new Date(startDate) : null;
  const end   = endDate   ? new Date(endDate)   : null;
  const now   = new Date();

  let progressPercent = 0;
  let daysLeft: number | null = null;

  if (start && end) {
    const totalMs    = end.getTime()  - start.getTime();
    const elapsedMs  = now.getTime()  - start.getTime();
    progressPercent  = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
    daysLeft = Math.max(0, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const overallScore = summary.evaluations.averageScores?.overall;
  const attendanceRate = summary.attendance.totalCheckIns > 0
    ? Math.round((summary.attendance.accepted / summary.attendance.totalCheckIns) * 100)
    : null;

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card shadow-card p-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 animate-icon-pop">
          <TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </span>
        <p className="text-sm font-semibold text-foreground">My progress</p>
      </div>

      {/* Internship timeline progress */}
      {start && end && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-muted-foreground">Internship duration</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {daysLeft !== null ? `${daysLeft}d left` : "—"}
            </div>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            <span>{end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          label="Check-ins"
          value={summary.attendance.totalCheckIns}
          sub={attendanceRate !== null ? `${attendanceRate}% accepted` : undefined}
          color="emerald"
        />
        <MiniStat
          label="Tasks done"
          value={summary.tasks.completed}
          sub={`of ${summary.tasks.total} total`}
          color="violet"
        />
        {overallScore !== null && overallScore !== undefined ? (
          <MiniStat
            label="Avg score"
            value={`${overallScore.toFixed(1)}/5`}
            sub="evaluation"
            color="amber"
            icon={Star}
          />
        ) : (
          <MiniStat
            label="Evaluations"
            value={summary.evaluations.count}
            sub="received"
            color="blue"
          />
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon?: React.ElementType;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet:  "text-violet-600 dark:text-violet-400",
    amber:   "text-amber-600 dark:text-amber-400",
    blue:    "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="rounded-xl bg-muted/60 px-2.5 py-2.5 text-center">
      <div className={cn("flex items-center justify-center gap-1 text-lg font-extrabold animate-count-in", colorMap[color])}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {value}
      </div>
      <p className="text-[10px] font-medium text-foreground/80 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>}
    </div>
  );
}
