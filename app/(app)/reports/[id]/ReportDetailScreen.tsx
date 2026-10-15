"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, CheckCircle2, Loader2, Edit2, X } from "lucide-react";
import { useReport, useUpdateReport, useSubmitReport } from "@/features/reports/reports.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ReportDetailScreen({ id }: { id: string }) {
  const router  = useRouter();
  const { data: report, isLoading } = useReport(id);
  const updateReport  = useUpdateReport(id);
  const submitReport  = useSubmitReport();

  const [editing,  setEditing]  = useState(false);
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");

  const startEditing = () => {
    if (!report) return;
    setTitle(report.title);
    setContent(report.content);
    setEditing(true);
  };

  const saveEdits = () => {
    updateReport.mutate(
      { title: title.trim(), content: content.trim() },
      { onSuccess: () => setEditing(false) }
    );
  };

  if (isLoading) return <ReportSkeleton onBack={() => router.back()} />;
  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <p className="text-muted-foreground">Report not found.</p>
      <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go back</Button>
    </div>
  );

  const isDraft    = report.status === "DRAFT";
  const isReviewed = report.status === "REVIEWED";

  const statusVariant = report.status === "REVIEWED" ? "success" : report.status === "SUBMITTED" ? "default" : "secondary";
  const statusLabel   = report.status === "REVIEWED" ? "Reviewed" : report.status === "SUBMITTED" ? "Submitted" : "Draft";

  return (
    <div className="flex flex-col pb-8">

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted hover-press">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="flex-1 truncate text-sm font-semibold text-foreground">Report</h1>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
        {isDraft && !editing && (
          <button onClick={startEditing} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted hover-press">
            <Edit2 className="h-4 w-4 text-foreground" />
          </button>
        )}
        {editing && (
          <button onClick={() => setEditing(false)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted hover-press">
            <X className="h-4 w-4 text-foreground" />
          </button>
        )}
      </div>

      <div className="px-4 pt-5 space-y-4 animate-fade-up">

        {/* Type + period */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{report.type === "DAILY" ? "Daily" : "Weekly"}</Badge>
          {report.periodStart && (
            <span>
              {new Date(report.periodStart).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              {report.periodEnd && ` – ${new Date(report.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            </span>
          )}
          <span className="ml-auto">
            Updated {new Date(report.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Editing mode */}
        {editing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-base font-semibold hover:border-primary/40 transition-colors"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none hover:border-primary/40 transition-colors"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
              <Button
                className="flex-1 gap-1.5"
                onClick={saveEdits}
                disabled={!title.trim() || !content.trim() || updateReport.isPending}
              >
                {updateReport.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save draft
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Read mode */}
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">{report.title}</h2>

            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{report.content}</p>
            </div>

            {/* Feedback */}
            {isReviewed && report.feedback && (
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-900/15 p-4 animate-scale-in">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Supervisor feedback</p>
                </div>
                <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">{report.feedback}</p>
              </div>
            )}

            {/* Submit CTA */}
            {isDraft && (
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => submitReport.mutate(id)}
                disabled={submitReport.isPending}
              >
                {submitReport.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit report
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReportSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="px-4 pt-5 space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
