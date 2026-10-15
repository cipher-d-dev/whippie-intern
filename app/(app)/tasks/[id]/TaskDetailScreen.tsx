"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Clock, User, CheckCircle2, RotateCcw,
  Play, Loader2, Send, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { useTask, useTaskSubmissions, useStartTask, useSubmitTask } from "@/features/tasks/tasks.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CFG: Record<TaskStatus, { label: string; variant: "default" | "secondary" | "warning" | "success" | "destructive"; color: string }> = {
  TODO:               { label: "To do",          variant: "secondary", color: "text-muted-foreground" },
  IN_PROGRESS:        { label: "In progress",    variant: "default",   color: "text-primary" },
  SUBMITTED:          { label: "Submitted",      variant: "secondary", color: "text-blue-500" },
  CHANGES_REQUESTED:  { label: "Changes needed", variant: "warning",   color: "text-amber-500" },
  COMPLETED:          { label: "Completed",      variant: "success",   color: "text-emerald-500" },
};

export function TaskDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: task, isLoading } = useTask(id);
  const { data: submissions } = useTaskSubmissions(id);
  const startTask  = useStartTask();
  const submitTask = useSubmitTask();

  const [submissionContent, setSubmissionContent] = useState("");
  const [showSubmitForm, setShowSubmitForm]         = useState(false);
  const [showHistory, setShowHistory]               = useState(false);

  if (isLoading) return <TaskDetailSkeleton onBack={() => router.back()} />;
  if (!task)     return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <p className="text-muted-foreground">Task not found.</p>
      <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go back</Button>
    </div>
  );

  const cfg = STATUS_CFG[task.status];
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "COMPLETED" && task.status !== "SUBMITTED";
  const canStart   = task.status === "TODO";
  const canSubmit  = task.status === "IN_PROGRESS" || task.status === "CHANGES_REQUESTED";
  const isComplete = task.status === "COMPLETED";

  const handleSubmit = () => {
    if (!submissionContent.trim()) return;
    submitTask.mutate({ taskId: task.id, content: submissionContent.trim() });
    setSubmissionContent("");
    setShowSubmitForm(false);
  };

  return (
    <div className="flex flex-col pb-8">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted hover-press"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="flex-1 truncate text-sm font-semibold text-foreground">Task detail</h1>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </div>

      <div className="px-4 pt-5 space-y-4 animate-fade-up">

        {/* Title + meta */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground leading-snug">
            {task.title}
          </h2>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {task.supervisor && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {task.supervisor.firstName} {task.supervisor.lastName}
              </span>
            )}
            {task.deadline && (
              <span className={cn("flex items-center gap-1", isOverdue && "font-semibold text-rose-500")}>
                <Clock className="h-3.5 w-3.5" />
                {isOverdue ? "Overdue · " : "Due "}
                {new Date(task.deadline).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Assigned {new Date(task.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short",
              })}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
        </div>

        {/* Changes requested feedback */}
        {task.status === "CHANGES_REQUESTED" && task.feedback && (
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/15 p-4 animate-scale-in">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Supervisor feedback
              </p>
            </div>
            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">{task.feedback}</p>
          </div>
        )}

        {/* Completed feedback */}
        {isComplete && task.feedback && (
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-900/15 p-4 animate-scale-in">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Approved — supervisor comment
              </p>
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">{task.feedback}</p>
          </div>
        )}

        {/* Start task CTA */}
        {canStart && (
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={() => startTask.mutate(task.id)}
            disabled={startTask.isPending}
          >
            {startTask.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Play className="h-4 w-4" />}
            Start task
          </Button>
        )}

        {/* Submit work */}
        {canSubmit && (
          <div className="space-y-3">
            {!showSubmitForm ? (
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => setShowSubmitForm(true)}
              >
                <Send className="h-4 w-4" />
                {task.status === "CHANGES_REQUESTED" ? "Resubmit work" : "Submit work"}
              </Button>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card space-y-3 animate-fade-up">
                <p className="text-sm font-semibold text-foreground">
                  {task.status === "CHANGES_REQUESTED" ? "Resubmit your work" : "Submit your work"}
                </p>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Describe what you've done, paste links, attach notes..."
                  rows={6}
                  className={cn(
                    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm",
                    "placeholder:text-muted-foreground/60 resize-none",
                    "transition-colors duration-150 hover:border-primary/40",
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowSubmitForm(false); setSubmissionContent(""); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleSubmit}
                    disabled={!submissionContent.trim() || submitTask.isPending}
                  >
                    {submitTask.isPending
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Send className="h-4 w-4" />}
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submission history */}
        {submissions && submissions.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 hover-press"
            >
              <p className="text-sm font-semibold text-foreground">
                Submission history ({submissions.length})
              </p>
              {showHistory
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {showHistory && (
              <ul className="divide-y divide-border/40 border-t border-border/40">
                {submissions.map((sub, i) => (
                  <li key={sub.id} className="px-4 py-3 space-y-1.5 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Attempt {i + 1} · {new Date(sub.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      <Badge
                        variant={
                          sub.status === "APPROVED"           ? "success"
                          : sub.status === "CHANGES_REQUESTED" ? "warning"
                          : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {sub.status === "APPROVED"           ? "Approved"
                          : sub.status === "CHANGES_REQUESTED" ? "Changes needed"
                          : "Pending review"}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap">{sub.content}</p>
                    {sub.feedback && (
                      <p className="text-xs text-muted-foreground italic">
                        Feedback: {sub.feedback}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TaskDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="px-4 pt-5 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
