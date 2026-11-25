"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import { useMyTasks } from "@/features/tasks/tasks.hooks";
import type { Task } from "@/features/tasks/tasks.api";
import type { TaskStatus } from "@/types";
import { fmtDate } from "@/lib/format";
import { TabHeader } from "@/components/layout/ScreenHeader";
import { WorkSwitch } from "@/components/layout/WorkSwitch";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

const GROUPS: { key: string; label: string; statuses: TaskStatus[]; empty: string }[] = [
  { key: "open",   label: "Open",      statuses: ["CHANGES_REQUESTED", "IN_PROGRESS", "TODO"], empty: "Nothing to do right now. New tasks from your supervisor show up here." },
  { key: "review", label: "In review", statuses: ["SUBMITTED"], empty: "Nothing waiting on your supervisor." },
  { key: "done",   label: "Done",      statuses: ["COMPLETED"], empty: "Approved tasks will collect here." },
];

export function TasksScreen() {
  const { data, isLoading, isError, refetch } = useMyTasks({ limit: 100 });
  const [group, setGroup] = useState("open");

  const tasks = data?.data ?? [];
  const current = GROUPS.find((g) => g.key === group)!;
  const shown = tasks
    .filter((t) => current.statuses.includes(t.status))
    .sort((a, b) => current.statuses.indexOf(a.status) - current.statuses.indexOf(b.status) || due(a) - due(b));
  const supervisor = tasks.find((t) => t.supervisor)?.supervisor;

  return (
    <div className="animate-fade-in">
      <TabHeader title="Work" aside={supervisor && <span>From {supervisor.firstName} {supervisor.lastName}</span>} />
      <WorkSwitch current="tasks" />

      <div role="tablist" aria-label="Task status" className="scrollbar-none flex gap-2 overflow-x-auto px-5 pb-4">
        {GROUPS.map((g) => {
          const count = tasks.filter((t) => g.statuses.includes(t.status)).length;
          const active = g.key === group;
          return (
            <button
              key={g.key}
              role="tab"
              aria-selected={active}
              onClick={() => setGroup(g.key)}
              className={cn(
                "press inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                active ? "border-foreground bg-foreground text-background" : "bg-card text-foreground hover:bg-muted",
              )}
            >
              {g.label}
              <span className={cn("font-mono text-xs", active ? "opacity-70" : "text-muted-foreground")}>{isLoading ? "–" : count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5 px-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[84px] rounded-2xl" />)
        ) : isError ? (
          <Card className="p-6 text-center">
            <p className="font-medium">Couldn&apos;t load your tasks</p>
            <button onClick={() => refetch()} className="mt-2 text-sm font-medium text-primary hover:underline">Try again</button>
          </Card>
        ) : shown.length === 0 ? (
          <Card className="px-6 py-10 text-center text-sm text-muted-foreground">{current.empty}</Card>
        ) : (
          shown.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </div>
    </div>
  );
}

function due(t: Task) {
  return t.deadline ? new Date(t.deadline).getTime() : Infinity;
}

function TaskCard({ task }: { task: Task }) {
  const open = task.status !== "COMPLETED" && task.status !== "SUBMITTED";
  const overdue = open && task.deadline && new Date(task.deadline) < new Date();
  return (
    <Link href={`/tasks/${task.id}`} className="press block rounded-2xl bg-card px-[18px] py-4 hover:bg-card/80 dark:border">
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 text-[15px] font-medium leading-snug">{task.title}</p>
        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <StatusBadge status={task.status} />
        {task.deadline && (
          <span className={cn("inline-flex items-center gap-1 text-xs", overdue ? "font-medium text-danger-foreground" : "text-muted-foreground")}>
            <Clock className="h-3.5 w-3.5" />
            {task.status === "COMPLETED" ? `Done ${fmtDate(task.completedAt ?? task.updatedAt)}` : `${overdue ? "Was due" : "Due"} ${fmtDate(task.deadline)}`}
          </span>
        )}
      </div>
    </Link>
  );
}
