"use client";

import { useState } from "react";
import {
  CalendarCheck, CheckCircle2, ClipboardList, FileText, FolderOpen, Send, Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMyInternRecord } from "@/features/dashboard/dashboard.hooks";
import { apiGetTimeline, type TimelineEventType, type TimelineEvent } from "@/features/timeline/timeline.api";
import { fmtDate } from "@/lib/format";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EVENT_ICON: Record<TimelineEventType, React.ElementType> = {
  ATTENDANCE:     CalendarCheck,
  TASK_ASSIGNED:  ClipboardList,
  TASK_COMPLETED: CheckCircle2,
  SUBMISSION:     Send,
  REPORT:         FileText,
  EVALUATION:     Star,
  DOCUMENT:       FolderOpen,
};

export function TimelineScreen() {
  const [page, setPage] = useState(1);
  const { data: intern } = useMyInternRecord();

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ["timeline", intern?.id, page],
    queryFn: () => apiGetTimeline(intern!.id, { page, limit: 30 }),
    enabled: !!intern?.id,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div className="animate-fade-in">
      <SubHeader title="Timeline" backHref="/profile" />
      <div className="px-5 pb-6 pt-1">
        <div>
          <TimelineTab timeline={timeline} isLoading={timelineLoading || !intern} page={page} setPage={setPage} />
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({
  timeline, isLoading, page, setPage,
}: {
  timeline: { data: TimelineEvent[]; totalPages: number } | undefined;
  isLoading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (isLoading) return <Skeleton className="h-80 rounded-2xl" />;

  const events = timeline?.data ?? [];
  if (events.length === 0) {
    return (
      <Card className="px-6 py-10 text-center">
        <p className="font-medium">Nothing here yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Check-ins, tasks, reports and evaluations will build up here as you go.</p>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <ol className="px-[18px] py-2">
          {events.map((evt, idx) => {
            const Icon = EVENT_ICON[evt.type] ?? ClipboardList;
            return (
              <li key={`${evt.refId ?? ""}-${idx}`} className="relative flex gap-3.5 py-3">
                {idx < events.length - 1 && <span aria-hidden="true" className="absolute bottom-[-12px] left-[17px] top-[48px] w-px bg-border" />}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{evt.title}</p>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{fmtDate(evt.date)}</span>
                  </div>
                  {evt.detail && <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{evt.detail}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {timeline && timeline.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-[13px] text-muted-foreground">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Newer</Button>
          <span className="font-mono">{page} / {timeline.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= timeline.totalPages} onClick={() => setPage((p) => p + 1)}>Older</Button>
        </div>
      )}
    </>
  );
}
