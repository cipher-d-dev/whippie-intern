"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Play, Send } from "lucide-react";
import { useTask, useTaskSubmissions, useStartTask, useSubmitTask } from "@/features/tasks/tasks.hooks";
import { fmtDate, fmtWhen } from "@/lib/format";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

export function TaskDetailScreen({ id }: { id: string }) {
  const { data: task, isLoading } = useTask(id);
  const { data: submissions } = useTaskSubmissions(id);
  const startTask = useStartTask();
  const submitTask = useSubmitTask();
  const [content, setContent] = useState("");

  if (isLoading) {
    return (
      <div>
        <SubHeader title="Task" backHref="/tasks" />
        <div className="space-y-3 px-5 pt-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-16 w-4/5" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div>
        <SubHeader title="Task" backHref="/tasks" />
        <div className="px-5 py-20 text-center">
          <p className="font-medium">We couldn&apos;t find that task</p>
          <Button variant="outline" className="mt-4" asChild><Link href="/tasks">Back to tasks</Link></Button>
        </div>
      </div>
    );
  }

  const sup = task.supervisor;
  const supName = sup ? `${sup.firstName}` : "Your supervisor";
  const open = task.status !== "COMPLETED" && task.status !== "SUBMITTED";
  const overdue = open && task.deadline && new Date(task.deadline) < new Date();
  const canSubmit = task.status === "IN_PROGRESS" || task.status === "CHANGES_REQUESTED";
  const resubmit = task.status === "CHANGES_REQUESTED";
  const history = [...(submissions ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const feedbackAt = history.find((s) => s.feedback)?.reviewedAt ?? task.updatedAt;

  const submit = () => {
    if (!content.trim()) return;
    submitTask.mutate({ taskId: task.id, content: content.trim() }, { onSuccess: () => setContent("") });
  };

  return (
    <div className="animate-fade-in">
      <SubHeader title="Task" backHref="/tasks" />

      <div className="flex flex-col gap-3.5 px-5 pb-4 pt-1">
        <div>
          <StatusBadge status={task.status} />
          <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em]">{task.title}</h2>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            {sup && <span>From {sup.firstName} {sup.lastName}</span>}
            {task.deadline && (
              <span className={cn(overdue && "font-medium text-danger-foreground")}>
                {overdue ? "Was due" : "Due"} {fmtDate(task.deadline)}
              </span>
            )}
          </p>
        </div>

        <Card className="px-[18px] py-4">
          <h3 className="text-[13px] font-medium text-muted-foreground">Brief</h3>
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed">{task.description}</p>
        </Card>

        {task.feedback && (task.status === "CHANGES_REQUESTED" || task.status === "COMPLETED") && (
          <div className={cn(
            "rounded-2xl border px-[18px] py-4",
            resubmit ? "border-warning/40 bg-warning-soft" : "border-success/30 bg-success-soft",
          )}>
            <div className="flex items-center gap-2.5">
              <PersonAvatar firstName={sup?.firstName} lastName={sup?.lastName} size="sm" />
              <div>
                <p className="text-sm font-semibold">{supName}&apos;s feedback</p>
                <p className={cn("font-mono text-xs", resubmit ? "text-warning-foreground" : "text-success-foreground")}>{fmtWhen(feedbackAt)}</p>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{task.feedback}</p>
          </div>
        )}

        {task.status === "TODO" && (
          <Button size="lg" className="w-full" onClick={() => startTask.mutate(task.id)} disabled={startTask.isPending}>
            {startTask.isPending ? <Loader2 className="animate-spin" /> : <Play />} Start task
          </Button>
        )}

        {canSubmit && (
          <Card className="px-[18px] py-4">
            <label htmlFor="submission" className="text-[13px] font-medium text-muted-foreground">
              {resubmit ? "Your resubmission" : "Your work"}
            </label>
            <textarea
              id="submission"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder={resubmit ? "What did you change? Paste links to the updated files." : "Describe what you did and paste links to your files (Google Drive, Docs…)."}
              className="mt-2 w-full resize-y rounded-xl border border-input bg-card px-3.5 py-3 text-[15px] placeholder:text-muted-foreground/70"
            />
            <Button size="lg" className="mt-3 w-full" onClick={submit} disabled={!content.trim() || submitTask.isPending}>
              {submitTask.isPending ? <Loader2 className="animate-spin" /> : <Send />}
              {resubmit ? `Resubmit to ${supName}` : `Send to ${supName}`}
            </Button>
          </Card>
        )}

        {task.status === "SUBMITTED" && (
          <p className="px-2 text-center text-[13px] text-muted-foreground">
            Sent. {supName} will review it and you&apos;ll get a notification.
          </p>
        )}

        {history.length > 0 && (
          <section aria-labelledby="history" className="pt-2">
            <h3 id="history" className="px-1 pb-2 text-[13px] font-medium text-muted-foreground">
              What you&apos;ve sent ({history.length})
            </h3>
            <ol className="space-y-2.5">
              {history.map((s, i) => (
                <li key={s.id}>
                  <Card className="px-[18px] py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{history.length - i} · {fmtWhen(s.createdAt)}
                      </span>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-sm">{s.content}</p>
                    {s.feedback && <p className="mt-2 border-t pt-2 text-[13px] text-muted-foreground">{s.feedback}</p>}
                  </Card>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
