"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useCreateReport } from "@/features/reports/reports.hooks";
import { Button } from "@/components/ui/button";
import type { ReportType } from "@/types";
import { cn } from "@/lib/utils";

export function NewReportScreen() {
  const router = useRouter();
  const createReport = useCreateReport();

  const [type,        setType]        = useState<ReportType>("DAILY");
  const [title,       setTitle]       = useState("");
  const [content,     setContent]     = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd,   setPeriodEnd]   = useState("");

  const canSave = title.trim().length > 0 && content.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    createReport.mutate(
      { type, title: title.trim(), content: content.trim(), periodStart: periodStart || undefined, periodEnd: periodEnd || undefined },
      { onSuccess: (report) => router.replace(`/reports/${report.id}`) }
    );
  };

  return (
    <div className="flex flex-col pb-8">

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted hover-press"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="flex-1 text-sm font-semibold text-foreground">New report</h1>
        <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={!canSave || createReport.isPending}>
          {createReport.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save draft
        </Button>
      </div>

      <div className="px-4 pt-5 space-y-4 animate-fade-up">

        {/* Type toggle */}
        <div className="flex rounded-2xl bg-muted p-1 gap-1">
          {(["DAILY", "WEEKLY"] as ReportType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200",
                type === t
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "DAILY" ? "Daily report" : "Weekly report"}
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "DAILY" ? "Work report — 15 Oct 2026" : "Weekly summary — W42 2026"}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 hover:border-primary/40 transition-colors"
          />
        </div>

        {/* Period */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Period start
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm hover:border-primary/40 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Period end
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm hover:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe what you worked on today, challenges faced, progress made..."
            rows={12}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 resize-none hover:border-primary/40 transition-colors"
          />
          <p className="text-right text-xs text-muted-foreground">{content.length} chars</p>
        </div>

      </div>
    </div>
  );
}
