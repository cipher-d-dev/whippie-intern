"use client";

import Link from "next/link";
import { useReport } from "@/features/reports/reports.hooks";
import { ReportEditor } from "@/features/reports/components/ReportEditor";
import { parseSections } from "@/features/reports/sections";
import { fmtDate, fmtWhen } from "@/lib/format";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function ReportDetailScreen({ id }: { id: string }) {
  const { data: report, isLoading } = useReport(id);

  if (isLoading) {
    return (
      <div>
        <SubHeader title="Report" backHref="/reports" />
        <div className="space-y-3 px-5 pt-2"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-40 rounded-2xl" /></div>
      </div>
    );
  }
  if (!report) {
    return (
      <div>
        <SubHeader title="Report" backHref="/reports" />
        <div className="px-5 py-20 text-center">
          <p className="font-medium">We couldn&apos;t find that report</p>
          <Button variant="outline" className="mt-4" asChild><Link href="/reports">Back to reports</Link></Button>
        </div>
      </div>
    );
  }

  // Drafts open straight into the editor.
  if (report.status === "DRAFT") return <ReportEditor key={report.id} report={report} />;

  const sections = parseSections(report.content);
  const period = report.periodStart
    ? report.periodEnd && report.periodEnd.slice(0, 10) !== report.periodStart.slice(0, 10)
      ? `${fmtDate(report.periodStart)} – ${fmtDate(report.periodEnd)}`
      : fmtDate(report.periodStart)
    : null;

  return (
    <div className="animate-fade-in">
      <SubHeader title={report.type === "WEEKLY" ? "Weekly report" : "Daily report"} backHref="/reports" />
      <div className="flex flex-col gap-3.5 px-5 pb-6 pt-1">
        <div className="px-1">
          <StatusBadge status={report.status} />
          <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em]">{report.title}</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {period && <span className="font-mono">{period}</span>}
            {period && " · "}Sent {fmtWhen(report.updatedAt)}
          </p>
        </div>

        {report.feedback && (
          <div className="rounded-2xl border border-success/30 bg-success-soft px-[18px] py-4">
            <p className="text-sm font-semibold">Supervisor feedback</p>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{report.feedback}</p>
          </div>
        )}

        <Card className="divide-y">
          {sections.map((s, i) => (
            <section key={i} className="px-[18px] py-4">
              {s.heading && <h3 className="text-[13px] font-medium text-muted-foreground">{s.heading}</h3>}
              <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed">{s.body || "—"}</p>
            </section>
          ))}
        </Card>

        {report.status === "SUBMITTED" && (
          <p className="px-2 text-center text-[13px] text-muted-foreground">Your supervisor hasn&apos;t reviewed this yet.</p>
        )}
      </div>
    </div>
  );
}
