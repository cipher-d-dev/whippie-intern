"use client";

import Link from "next/link";
import { ChevronRight, FileText, Plus } from "lucide-react";
import { useMyReports } from "@/features/reports/reports.hooks";
import type { Report } from "@/features/reports/reports.api";
import { parseSections, workWeek } from "@/features/reports/sections";
import { fmtDate, fmtWhen } from "@/lib/format";
import { TabHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function ReportsScreen() {
  const { data, isLoading, isError, refetch } = useMyReports();
  const reports = [...(data?.data ?? [])].sort(
    (a, b) => +new Date(b.periodStart ?? b.createdAt) - +new Date(a.periodStart ?? a.createdAt),
  );

  const { start, end } = workWeek();
  const thisWeek = reports.find((r) => r.type === "WEEKLY" && r.periodStart && r.periodStart.slice(0, 10) >= start && r.periodStart.slice(0, 10) <= end);

  return (
    <div className="animate-fade-in">
      <TabHeader
        title="Reports"
        aside={
          <Button size="sm" variant="outline" className="h-10 rounded-full" asChild>
            <Link href="/reports/new?type=DAILY"><Plus /> Daily</Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3.5 px-5">
        {!isLoading && !thisWeek && (
          <div className="rounded-2xl bg-primary p-[18px] text-primary-foreground">
            <p className="text-[13px] opacity-90">Due Friday</p>
            <p className="mt-1 text-lg font-semibold">This week&apos;s report</p>
            <p className="mt-1 text-sm opacity-90">Your logbook for the week: a few lines for each day you worked.</p>
            <Link
              href="/reports/new?type=WEEKLY"
              className="press mt-4 inline-flex h-11 items-center rounded-xl bg-card px-4 text-[15px] font-medium text-primary hover:bg-card/90"
            >
              Write it now
            </Link>
          </div>
        )}

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[76px] rounded-2xl" />)
        ) : isError ? (
          <Card className="p-6 text-center">
            <p className="font-medium">Couldn&apos;t load your reports</p>
            <button onClick={() => refetch()} className="mt-2 text-sm font-medium text-primary hover:underline">Try again</button>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="px-6 py-10 text-center text-sm text-muted-foreground">
            Reports you write will show up here, with your supervisor&apos;s feedback.
          </Card>
        ) : (
          <Card>
            <ul className="divide-y">
              {reports.map((r) => <ReportRow key={r.id} report={r} />)}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function ReportRow({ report }: { report: Report }) {
  const preview = parseSections(report.content).find((s) => s.body)?.body ?? "";
  return (
    <li>
      <Link href={`/reports/${report.id}`} className="flex items-center gap-3 px-[18px] py-3.5 hover:bg-muted/50">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FileText className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[15px] font-medium">{report.title}</span>
          </span>
          <span className="block truncate text-[13px] text-muted-foreground">
            {report.feedback ? `Feedback: ${report.feedback}` : preview || (report.type === "WEEKLY" ? "Weekly report" : "Daily report")}
          </span>
          <span className="mt-1.5 flex items-center gap-2">
            <StatusBadge status={report.status} />
            <span className="font-mono text-xs text-muted-foreground">
              {report.status === "DRAFT" ? `Edited ${fmtWhen(report.updatedAt)}` : fmtDate(report.periodStart ?? report.createdAt)}
            </span>
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}
