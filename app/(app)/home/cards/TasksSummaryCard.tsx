"use client";

import { FileText, ChevronRight, Clock, RotateCcw, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TaskItem } from "@/features/dashboard/dashboard.api";
import type { InternSummary } from "@/features/interns/interns.api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  tasks: TaskItem[];
  summary?: InternSummary["tasks"];
  isLoading: boolean;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "destructive" | "secondary"; icon: React.ElementType }> = {
  TODO:               { label: "To do",            variant: "secondary",   icon: FileText },
  IN_PROGRESS:        { label: "In progress",       variant: "default",     icon: Play },
  CHANGES_REQUESTED:  { label: "Changes needed",    variant: "warning",     icon: RotateCcw },
};

export function TasksSummaryCard({ tasks, summary, isLoading, className }: Props) {
  const router = useRouter();

  if (isLoading) return <Skeleton className={cn("h-40 w-full", className)} />;

  const completionRate = summary?.completionRate ?? 0;
  const total = summary?.total ?? 0;
  const completed = summary?.completed ?? 0;

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card shadow-card", className)}>
      {/* Header */}
      <button
        onClick={() => router.push("/tasks")}
        className="flex w-full items-center justify-between px-4 pt-4 pb-3 hover-press"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 animate-icon-pop">
            <FileText className="h-4 w-4 text-primary" />
          </span>
          <p className="text-sm font-semibold text-foreground">My tasks</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </button>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-muted-foreground">
              {completed} / {total} completed
            </p>
            <p className="text-xs font-semibold text-primary">{completionRate}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground text-center py-3">
            🎉 No pending tasks — you&apos;re all caught up!
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/40 border-t border-border/40">
          {tasks.slice(0, 4).map((task, i) => {
            const cfg = statusConfig[task.status] ?? statusConfig.TODO;
            const Icon = cfg.icon;
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "COMPLETED";

            return (
              <li
                key={task.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                  {task.deadline && (
                    <p className={cn("text-xs", isOverdue ? "text-rose-500 font-medium" : "text-muted-foreground")}>
                      {isOverdue ? "Overdue · " : "Due "}
                      {new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
                <Badge variant={cfg.variant} className="flex-shrink-0 text-[10px]">
                  {cfg.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
