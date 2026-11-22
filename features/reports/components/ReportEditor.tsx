"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ReportType } from "@/types";
import { apiCreateReport, apiSubmitReport, apiUpdateReport, type Report } from "@/features/reports/reports.api";
import { REPORT_KEY } from "@/features/reports/reports.hooks";
import { PROMPTS, isoDate, joinSections, parseSections, workWeek, type Section } from "@/features/reports/sections";
import { useMyInternRecord } from "@/features/dashboard/dashboard.hooks";
import { fmtDate, fmtTime, programmeProgress } from "@/lib/format";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Writes a report as answers to a few short prompts. The answers are saved
 * together in the report's `content` as "## Heading" blocks (see sections.ts).
 * Reports written before this (free text) open as a single text box.
 */
export function ReportEditor({ report, initialType = "WEEKLY" }: { report?: Report; initialType?: ReportType }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: intern } = useMyInternRecord();

  const [type, setType] = useState<ReportType>(report?.type ?? initialType);
  const [savedAt, setSavedAt] = useState<string | null>(report?.updatedAt ?? null);
  const [dirty, setDirty] = useState(false);

  // One answer per prompt; legacy free-text reports keep a single section.
  const initial = useMemo(() => (report ? parseSections(report.content) : null), [report]);
  const legacy = !!initial && initial.some((s) => !s.heading || !PROMPTS[report!.type].some((p) => p.heading === s.heading));
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (!initial) return {};
    if (legacy) return { __free: report!.content };
    return Object.fromEntries(initial.map((s) => [s.heading!, s.body]));
  });

  const week = programmeProgress(intern?.startDate, intern?.endDate)?.currentWeek;
  const period = report?.periodStart
    ? { start: report.periodStart.slice(0, 10), end: (report.periodEnd ?? report.periodStart).slice(0, 10) }
    : type === "WEEKLY"
      ? workWeek()
      : { start: isoDate(new Date()), end: isoDate(new Date()) };
  const defaultTitle = type === "WEEKLY" ? (week ? `Week ${week} report` : `Week of ${fmtDate(period.start)}`) : `Daily report · ${fmtDate(period.start)}`;
  const [title, setTitle] = useState(report?.title ?? "");
  const effectiveTitle = title.trim() || defaultTitle;

  const prompts = PROMPTS[type];
  const sections: Section[] = legacy
    ? [{ heading: null, body: answers.__free ?? "" }]
    : prompts.map((p) => ({ heading: p.heading, body: answers[p.heading] ?? "" }));
  const content = joinSections(sections);
  const missing = legacy ? (content ? [] : ["Report"]) : prompts.filter((p) => !p.optional && !(answers[p.heading] ?? "").trim()).map((p) => p.heading);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async (): Promise<Report> => {
    if (report) return apiUpdateReport(report.id, { title: effectiveTitle, content });
    return apiCreateReport({ type, title: effectiveTitle, content, periodStart: period.start, periodEnd: period.end });
  };

  const draftMut = useMutation({
    mutationFn: save,
    onSuccess: (r) => {
      setDirty(false);
      setSavedAt(r.updatedAt ?? new Date().toISOString());
      qc.setQueryData(REPORT_KEY(r.id), r);
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Draft saved");
      if (!report) router.replace(`/reports/${r.id}`);
    },
    onError: (err: any) => toast.error(err?.body?.message ?? "Couldn't save your draft. Try again."),
  });

  const submitMut = useMutation({
    mutationFn: async () => apiSubmitReport((await save()).id),
    onSuccess: (r) => {
      setDirty(false);
      qc.setQueryData(REPORT_KEY(r.id), r);
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report sent to your supervisor");
      router.replace(`/reports/${r.id}`);
    },
    onError: (err: any) => toast.error(err?.body?.message ?? "Couldn't send your report. Try again."),
  });

  const busy = draftMut.isPending || submitMut.isPending;
  const set = (key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setDirty(true);
  };

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <SubHeader
        title={report ? "Edit report" : "New report"}
        backHref="/reports"
        close
        action={
          savedAt && !dirty ? (
            <span className="text-right text-[11px] leading-tight text-muted-foreground">
              Draft saved<br /><span className="font-mono">{fmtTime(savedAt)}</span>
            </span>
          ) : undefined
        }
      />

      <div className="flex flex-1 flex-col gap-3.5 px-5 pb-6 pt-1">
        {!report && (
          <div role="radiogroup" aria-label="Report type" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["WEEKLY", "DAILY"] as ReportType[]).map((t) => (
              <button
                key={t}
                role="radio"
                aria-checked={type === t}
                onClick={() => setType(t)}
                className={cn(
                  "h-10 rounded-lg text-sm font-medium transition-colors",
                  type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "WEEKLY" ? "Weekly" : "Daily"}
              </button>
            ))}
          </div>
        )}

        <div className="px-1">
          <p className="font-mono text-xs text-muted-foreground">
            {period.start === period.end ? fmtDate(period.start) : `${fmtDate(period.start)} – ${fmtDate(period.end)}`}
          </p>
          <label htmlFor="report-title" className="sr-only">Title</label>
          <input
            id="report-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
            placeholder={defaultTitle}
            maxLength={200}
            className="mt-1 w-full rounded-md bg-transparent text-2xl font-semibold tracking-[-0.02em] placeholder:text-foreground focus:placeholder:text-muted-foreground/60"
          />
        </div>

        {!legacy && type === "WEEKLY" && (
          <p className="px-1 text-[13px] text-muted-foreground">Write what you did on each day you worked. Leave out days you weren&apos;t in.</p>
        )}

        {legacy ? (
          <PromptCard id="free" label="Report" value={answers.__free ?? ""} placeholder="" onChange={(v) => set("__free", v)} />
        ) : (
          prompts.map((p, i) => (
            <PromptCard
              key={`${type}-${p.heading}`}
              id={`p${i}`}
              label={p.heading}
              optional={p.optional && type !== "WEEKLY"}
              placeholder={p.placeholder}
              value={answers[p.heading] ?? ""}
              onChange={(v) => set(p.heading, v)}
            />
          ))
        )}

        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] -mx-5 mt-auto bg-background/95 px-5 pb-3 pt-3 backdrop-blur-md">
          {missing.length > 0 && content && (
            <p className="pb-2 text-center text-[13px] text-muted-foreground">
              Fill in {missing.map((m) => `“${m}”`).join(" and ")} to send it.
            </p>
          )}
          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <Button variant="outline" size="lg" onClick={() => draftMut.mutate()} disabled={busy || !content}>
              {draftMut.isPending && <Loader2 className="animate-spin" />} Save draft
            </Button>
            <Button size="lg" onClick={() => submitMut.mutate()} disabled={busy || missing.length > 0 || !content}>
              {submitMut.isPending && <Loader2 className="animate-spin" />} Submit report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromptCard({
  id, label, optional, placeholder, value, onChange,
}: {
  id: string; label: string; optional?: boolean; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <Card className="px-[18px] py-4">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[15px] font-semibold">{label}</label>
        {optional && <span className="text-xs text-muted-foreground">Optional</span>}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2.5 w-full resize-y rounded-xl border border-input bg-card px-3.5 py-3 text-[15px] leading-relaxed placeholder:text-muted-foreground/70"
      />
    </Card>
  );
}
