"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronRight, ClipboardList } from "lucide-react";
import { useMyEvaluations } from "@/features/evaluations/evaluations.hooks";
import { type Evaluation, type EvaluationScores } from "@/features/evaluations/evaluations.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function EvaluationsScreen() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { data, isLoading } = useMyEvaluations(page);

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-5 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">Evaluations</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Performance reviews from your supervisor</p>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : !data || data.data.length === 0 ? (
          <EmptyEvaluations />
        ) : (
          <>
            {data.data.map((ev, i) => (
              <EvaluationCard
                key={ev._id}
                evaluation={ev}
                index={i}
                onTap={() => router.push(`/evaluations/${ev._id}`)}
              />
            ))}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-xs font-semibold text-primary disabled:opacity-40"
                >
                  ← Previous
                </button>
                <span className="text-xs text-muted-foreground">
                  {page} / {data.totalPages}
                </span>
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-xs font-semibold text-primary disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Evaluation card ──────────────────────────────────────────────────────────

function EvaluationCard({
  evaluation,
  index,
  onTap,
}: {
  evaluation: Evaluation;
  index: number;
  onTap: () => void;
}) {
  const avg = averageScore(evaluation.scores);
  const supervisorName =
    typeof evaluation.supervisor === "object"
      ? `${evaluation.supervisor.firstName} ${evaluation.supervisor.lastName}`
      : "Supervisor";

  return (
    <button
      onClick={onTap}
      className="w-full text-left rounded-2xl border border-border/60 bg-card p-4 shadow-card hover-press animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ScoreStars score={avg} />
            <span className="text-xs font-bold text-foreground">{avg.toFixed(1)}</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            By {supervisorName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {evaluation.submittedAt
              ? new Date(evaluation.submittedAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })
              : new Date(evaluation.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="success" className="text-[10px]">Submitted</Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
}

// ─── Detail page ──────────────────────────────────────────────────────────────

export function EvaluationDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: evaluation, isLoading } = useEvaluationDetail(id);

  if (isLoading) return <EvaluationDetailSkeleton />;
  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-sm text-muted-foreground">Evaluation not found.</p>
      </div>
    );
  }

  const supervisorName =
    typeof evaluation.supervisor === "object"
      ? `${evaluation.supervisor.firstName} ${evaluation.supervisor.lastName}`
      : "Supervisor";

  const scoreLabels: Array<{ key: keyof EvaluationScores; label: string }> = [
    { key: "workQuality",      label: "Work Quality" },
    { key: "reliability",      label: "Reliability" },
    { key: "communication",    label: "Communication" },
    { key: "learningProgress", label: "Learning Progress" },
    { key: "professionalism",  label: "Professionalism" },
  ];

  const avg = averageScore(evaluation.scores);

  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-5 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          ← Evaluations
        </button>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
          Performance Review
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">By {supervisorName}</p>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Overall score */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card space-y-3 animate-fade-up">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall</p>
            <Badge variant="success" className="text-[10px]">Submitted</Badge>
          </div>
          <div className="flex items-center gap-3">
            <ScoreStars score={avg} size="lg" />
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              {avg.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
          {evaluation.submittedAt && (
            <p className="text-xs text-muted-foreground">
              Submitted{" "}
              {new Date(evaluation.submittedAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Per-category scores */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card space-y-4 animate-fade-up delay-50">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Breakdown</p>
          {scoreLabels.map(({ key, label }) => (
            <ScoreRow key={key} label={label} score={evaluation.scores[key]} />
          ))}
        </div>

        {/* Comments */}
        {evaluation.comments && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card space-y-2 animate-fade-up delay-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Supervisor comments
            </p>
            <p className="text-sm text-foreground leading-relaxed">{evaluation.comments}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRow({ label, score }: { label: string; score: number }) {
  const pct = (score / 5) * 100;
  const color =
    score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <span className="text-sm font-bold text-foreground">{score}<span className="text-xs text-muted-foreground">/5</span></span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ScoreStars({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(sz, s <= Math.round(score) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40")}
        />
      ))}
    </div>
  );
}

function EmptyEvaluations() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted animate-float">
        <ClipboardList className="h-7 w-7 text-muted-foreground" />
      </span>
      <p className="text-sm font-medium text-foreground">No evaluations yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Your supervisor's performance reviews will appear here.
      </p>
    </div>
  );
}

function EvaluationDetailSkeleton() {
  return (
    <div className="px-4 pt-20 space-y-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

// ─── Import for detail screen ─────────────────────────────────────────────────
import { useEvaluationDetail } from "@/features/evaluations/evaluations.hooks";

function averageScore(scores: EvaluationScores): number {
  const vals = Object.values(scores) as number[];
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
