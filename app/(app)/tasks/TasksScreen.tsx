"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Clock, RotateCcw, Play, CheckCircle2, ChevronRight, AlertCircle,
} from "lucide-react";
import { useMyTasks } from "@/features/tasks/tasks.hooks";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/features/tasks/tasks.api";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: TaskStatus | undefined }[] = [
  { label: "All",         value: undefined },
  { label: "To do",       value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Changes",     value: "CHANGES_REQUESTED" },
  { label: "Done",        value: "COMPLETED" },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<TaskStatus, {
  label: string;
  variant: "default" | "secondary" | "warning" | "success" | "destructive";
  icon: React.ElementType;
  color: string;
}> = {
  TODO:               { label: "To do",         variant: "secondary",   icon: FileText,     color: "text-muted-foreground" },
  IN_PROGRESS:        { label: "In progress",   variant: "default",     icon: Play,         color: "text-primary" },
  SUBMITTED:          { label: "Submitted",     variant: "secondary",   icon: CheckCircle2, color: "text-blue-500" },
  CHANGES_REQUESTED:  { label: "Changes needed",variant: "warning",     icon: RotateCcw,    color: "text-amber-500" },
  COMPLETED:          { label: "Completed",     variant: "success",     icon: CheckCircle2, color: "text-emerald-500" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TasksScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<TaskStatus | undefined>(undefined);
  const { data, isLoading } = useMyTasks({ status: activeFilter, limit: 50 });
  const tasks = data?.data ?? [];

  return (
    <div className="flex flex-col pb-4">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-5 pb-3">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground animate-fade-up">
          My tasks
        </h1>

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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : tasks.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i}
              onClick={() => router.push(`/tasks/${task.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Task card ────────────────────────────────────────────────────────────────

function TaskCard({ task, index, onClick }: { task: Task; index: number; onClick: () => void }) {
  const cfg  = STATUS_CFG[task.status];
  const Icon = cfg.icon;
  const isOverdue = task.deadline
    && new Date(task.deadline) < new Date()
    && task.status !== "COMPLETED"
    && task.status !== "SUBMITTED";

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border/60 bg-card p-4 shadow-card hover-lift hover-press animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className={cn(
          "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-muted",
          task.status === "CHANGES_REQUESTED" && "bg-amber-50 dark:bg-amber-900/20",
          task.status === "IN_PROGRESS"       && "bg-primary/10",
          task.status === "COMPLETED"         && "bg-emerald-50 dark:bg-emerald-900/20",
        )}>
          <Icon className={cn("h-4 w-4", cfg.color)} />
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
              {task.title}
            </p>
            <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>

            {task.deadline && (
              <span className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "font-semibold text-rose-500" : "text-muted-foreground",
              )}>
                <Clock className="h-3 w-3" />
                {isOverdue ? "Overdue · " : ""}
                {new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>

          {/* Changes requested notice */}
          {task.status === "CHANGES_REQUESTED" && task.feedback && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5">
              <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
              <p className="text-xs text-amber-800 dark:text-amber-300 line-clamp-2">{task.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: TaskStatus | undefined }) {
  const messages: Partial<Record<TaskStatus, string>> = {
    TODO:              "No tasks to do — you're ahead of the curve.",
    IN_PROGRESS:       "Nothing in progress right now.",
    CHANGES_REQUESTED: "No tasks need changes — great work!",
    COMPLETED:         "No completed tasks yet. Keep going!",
  };
  const msg = filter ? (messages[filter] ?? "No tasks found.") : "No tasks assigned yet.";

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted animate-float">
        <FileText className="h-7 w-7 text-muted-foreground" />
      </span>
      <p className="text-sm font-medium text-foreground">{msg}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Your supervisor will assign tasks here.
      </p>
    </div>
  );
}
