"use client";

import { useRef, useState } from "react";
import {
  CalendarCheck, CheckCircle2, ClipboardList, Download, FileCheck2, FileText, FolderOpen, Loader2, Send, Star, Upload,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMyInternRecord } from "@/features/dashboard/dashboard.hooks";
import { apiGetTimeline, type TimelineEventType, type TimelineEvent } from "@/features/timeline/timeline.api";
import { useDocumentChecklist, useUploadDocument } from "@/features/documents/documents.hooks";
import { getDocumentDownloadUrl, type ChecklistItem } from "@/features/documents/documents.api";
import { fmtDate } from "@/lib/format";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

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
  const [tab, setTab] = useState<"timeline" | "documents">("timeline");
  const { data: intern } = useMyInternRecord();

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ["timeline", intern?.id, page],
    queryFn: () => apiGetTimeline(intern!.id, { page, limit: 30 }),
    enabled: !!intern?.id && tab === "timeline",
    staleTime: 2 * 60 * 1000,
  });
  const { data: checklist, isLoading: docsLoading } = useDocumentChecklist(intern?.id);

  return (
    <div className="animate-fade-in">
      <SubHeader title="Timeline & documents" backHref="/profile" />
      <div className="px-5 pb-6 pt-1">
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(["timeline", "documents"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "h-10 rounded-lg text-sm font-medium transition-colors",
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "timeline" ? "Timeline" : "Documents"}
            </button>
          ))}
        </div>
        <div className="pt-3.5">
          {tab === "timeline" ? (
            <TimelineTab timeline={timeline} isLoading={timelineLoading || !intern} page={page} setPage={setPage} />
          ) : (
            <DocumentsTab checklist={checklist} isLoading={docsLoading || !intern} internId={intern?.id} />
          )}
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

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({
  checklist,
  isLoading,
  internId,
}: {
  checklist: ChecklistItem[] | undefined;
  isLoading: boolean;
  internId?: string;
}) {
  const uploadDoc = useUploadDocument(internId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const handleSelectFile = (docId: string) => {
    setSelectedDocId(docId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocId) return;
    uploadDoc.mutate({ documentId: selectedDocId, file });
    e.target.value = "";
  };

  if (isLoading) return <Skeleton className="h-72 rounded-2xl" />;

  const items = checklist ?? [];
  const done = items.filter((i) => i.document && i.document.status !== "PENDING").length;

  return (
    <>
      <input ref={fileInputRef} type="file" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={handleFileChange} />

      <Card>
        <div className="flex items-baseline justify-between px-[18px] pb-2 pt-4">
          <h2 className="text-[15px] font-semibold">Your documents</h2>
          <span className="text-[13px] text-muted-foreground"><span className="font-mono text-foreground">{done}</span> of {items.length} done</span>
        </div>
        <p className="px-[18px] pb-2 text-[13px] text-muted-foreground">Upload a clear scan or photo. HR will check each one.</p>
        <ul className="px-[18px] pb-2">
          {items.map((item) => {
            const doc = item.document;
            const docId = doc?.id ?? item.requirement.id;
            const uploading = uploadDoc.isPending && selectedDocId === docId;
            const canUpload = !doc || doc.status === "PENDING" || doc.status === "REJECTED";
            return (
              <li key={item.requirement.id} className="flex items-center gap-3 border-t py-3.5">
                <span className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  doc?.status === "VERIFIED" ? "bg-success-soft text-success-foreground" : "bg-muted text-muted-foreground",
                )}>
                  {doc ? <FileCheck2 className="h-[18px] w-[18px]" /> : <FolderOpen className="h-[18px] w-[18px]" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.requirement.label}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {doc ? <StatusBadge status={doc.status} /> : <span className="text-xs text-muted-foreground">{item.requirement.isRequired ? "Required" : "Optional"}</span>}
                    {doc?.originalFilename && <span className="truncate text-xs text-muted-foreground">{doc.originalFilename}</span>}
                  </div>
                </div>
                {canUpload ? (
                  <Button size="sm" variant={doc ? "outline" : "default"} onClick={() => handleSelectFile(docId)} disabled={uploadDoc.isPending}>
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                    {doc ? "Replace" : "Upload"}
                  </Button>
                ) : doc ? (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={getDocumentDownloadUrl(doc.id)} target="_blank" rel="noreferrer" aria-label={`Download ${item.requirement.label}`}>
                      <Download className="h-[18px] w-[18px]" />
                    </a>
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
