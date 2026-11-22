"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useEvaluationDetail, useMyEvaluations } from "@/features/evaluations/evaluations.hooks";
import type { Evaluation, EvaluationScores } from "@/features/evaluations/evaluations.api";
import { fmtDate } from "@/lib/format";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CATEGORIES: { key: keyof EvaluationScores; label: string }[] = [
  { key: "workQuality",      label: "Quality of work" },
  { key: "reliability",      label: "Reliability" },
  { key: "communication",    label: "Communication" },
  { key: "learningProgress", label: "Learning" },
  { key: "professionalism",  label: "Professionalism" },
];

const LABELS = ["", "Needs work", "Developing", "Meets expectations", "Strong", "Excellent"];

function averageScore(scores: EvaluationScores) {
  const vals = CATEGORIES.map((c) => scores[c.key]).filter((v) => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function evalId(e: Evaluation) {
  return e._id ?? (e as unknown as { id: string }).id;
}

function supervisorName(e: Evaluation) {
  return typeof e.supervisor === "object" ? `${e.supervisor.firstName} ${e.supervisor.lastName}` : "Your supervisor";
}

export function EvaluationsScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyEvaluations(page);
  const items = data?.data ?? [];

  return (
    <div className="animate-fade-in">
      <SubHeader title="Evaluations" backHref="/profile" />
      <div className="space-y-2.5 px-5 pb-6 pt-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-2xl" />)
        ) : items.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <p className="font-medium">No evaluations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">When your supervisor reviews your work, you&apos;ll see their scores and comments here.</p>
          </Card>
        ) : (
          items.map((ev) => {
            const avg = averageScore(ev.scores);
            return (
              <Link key={evalId(ev)} href={`/evaluations/${evalId(ev)}`} className="press flex items-center gap-4 rounded-2xl bg-card px-[18px] py-4 hover:bg-card/80 dark:border">
                <span className="font-mono text-[28px] font-medium leading-none tracking-[-0.03em] tabular">{avg.toFixed(1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{LABELS[Math.round(avg)]}</span>
                  <span className="block truncate text-[13px] text-muted-foreground">
                    {supervisorName(ev)} · {fmtDate(ev.submittedAt ?? ev.createdAt, true)}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-[13px] text-muted-foreground">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Newer</Button>
            <span className="font-mono">{page} / {data.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Older</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function EvaluationDetailScreen({ id }: { id: string }) {
  const { data: evaluation, isLoading } = useEvaluationDetail(id);

  if (isLoading) {
    return (
      <div>
        <SubHeader title="Evaluation" backHref="/evaluations" />
        <div className="space-y-3 px-5 pt-1"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
      </div>
    );
  }
  if (!evaluation) {
    return (
      <div>
        <SubHeader title="Evaluation" backHref="/evaluations" />
        <p className="px-5 py-20 text-center text-sm text-muted-foreground">We couldn&apos;t find that evaluation.</p>
      </div>
    );
  }

  const avg = averageScore(evaluation.scores);

  return (
    <div className="animate-fade-in">
      <SubHeader title="Evaluation" backHref="/evaluations" />
      <div className="flex flex-col gap-3.5 px-5 pb-6 pt-1">
        <Card className="px-[18px] py-5">
          <p className="text-[13px] text-muted-foreground">
            From {supervisorName(evaluation)} · {fmtDate(evaluation.submittedAt ?? evaluation.createdAt, true)}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-[44px] font-medium leading-none tracking-[-0.04em] tabular">{avg.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
          <p className="mt-1.5 text-[15px] font-medium">{LABELS[Math.round(avg)]}</p>
        </Card>

        <Card>
          <h2 className="px-[18px] pb-1 pt-4 text-[15px] font-semibold">Scores</h2>
          <ul className="px-[18px] pb-2">
            {CATEGORIES.map(({ key, label }) => {
              const v = evaluation.scores[key];
              return (
                <li key={key} className="border-t py-3 first:border-t-0">
                  <div className="flex items-baseline justify-between text-sm">
                    <span>{label}</span>
                    <span><span className="font-mono font-medium">{v}</span><span className="text-muted-foreground">/5</span></span>
                  </div>
                  <div className="mt-2 grid grid-cols-5 gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={cn("h-1.5 rounded-full", n <= v ? "bg-primary" : "bg-muted")} />
                    ))}
                  </div>
                  <span className="sr-only">{LABELS[v]}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        {evaluation.comments && (
          <Card className="px-[18px] py-4">
            <h2 className="text-[15px] font-semibold">Comments</h2>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{evaluation.comments}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
