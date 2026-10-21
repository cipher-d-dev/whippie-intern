"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck, ClipboardList, CheckCircle2,
  FileText, Star, FolderOpen, Upload, Loader2,
  Download, AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMyInternRecord } from "@/features/dashboard/dashboard.hooks";
import { apiGetTimeline, type TimelineEventType, type TimelineEvent } from "@/features/timeline/timeline.api";
import { useDocumentChecklist, useUploadDocument } from "@/features/documents/documents.hooks";
import { getDocumentDownloadUrl, type ChecklistItem } from "@/features/documents/documents.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EVENT_CFG: Record<TimelineEventType, { icon: React.ElementType; color: string; bg: string }> = {
  ATTENDANCE:     { icon: ClipboardCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  TASK_ASSIGNED:  { icon: ClipboardList,  color: "text-primary",     bg: "bg-primary/10" },
  TASK_COMPLETED: { icon: CheckCircle2,   color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  SUBMISSION:     { icon: FileText,       color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20" },
  REPORT:         { icon: FileText,       color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-900/20" },
  EVALUATION:     { icon: Star,           color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/20" },
  DOCUMENT:       { icon: FolderOpen,     color: "text-muted-foreground", bg: "bg-muted" },
};

export function TimelineScreen() {
  const [page, setPage] = useState(1);
  const [tab, setTab]   = useState<"timeline" | "documents">("timeline");

  const { data: intern } = useMyInternRecord();

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ["timeline", intern?.id, page],
    queryFn: () => apiGetTimeline(intern!.id, { page, limit: 30 }),
    enabled: !!intern?.id && tab === "timeline",
    staleTime: 2 * 60 * 1000,
  });

  const { data: checklist, isLoading: docsLoading } = useDocumentChecklist(
    tab === "documents" ? intern?.id : undefined,
  );

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-5 pb-3">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground animate-fade-up">Timeline</h1>
        <div className="mt-3 flex rounded-2xl bg-muted p-1 gap-1">
          {(["timeline", "documents"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200 capitalize",
                tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "timeline" ? "📅 Timeline" : "📁 Documents"}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline tab */}
      {tab === "timeline" && (
        <div className="px-4 pt-5">
          {timelineLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !timeline || timeline.data.length === 0 ? (
            <EmptyTimeline />
          ) : (
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/60" aria-hidden />
              <ul className="space-y-0">
                {timeline.data.map((event, i) => (
                  <TimelineRow key={i} event={event} index={i} />
                ))}
              </ul>
              {timeline.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between py-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-xs font-medium text-primary disabled:opacity-40">← Earlier</button>
                  <span className="text-xs text-muted-foreground">{page} / {timeline.totalPages}</span>
                  <button disabled={page >= timeline.totalPages} onClick={() => setPage((p) => p + 1)} className="text-xs font-medium text-primary disabled:opacity-40">Later →</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Documents tab */}
      {tab === "documents" && (
        <div className="px-4 pt-5 space-y-3">
          {docsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
          ) : !checklist || checklist.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No document requirements yet.</div>
          ) : (
            checklist.map((item, i) => (
              <DocumentCard
                key={item.requirement.id}
                item={item}
                internId={intern?.id}
                index={i}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Document card with upload ────────────────────────────────────────────────

function DocumentCard({
  item,
  internId,
  index,
}: {
  item: ChecklistItem;
  internId?: string;
  index: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const upload  = useUploadDocument(internId);

  const doc    = item.document;
  const status = doc?.status ?? null;

  // Can upload if: no doc yet, or doc was rejected
  const canUpload = !status || status === "REJECTED" || status === "PENDING";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !doc) return;
    upload.mutate({ documentId: doc.id, file });
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div
      className="rounded-2xl border border-border/60 bg-card p-4 shadow-card animate-fade-up space-y-3"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{item.requirement.label}</p>
            {item.requirement.isRequired && (
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Required</span>
            )}
          </div>
          {item.requirement.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{item.requirement.description}</p>
          )}
        </div>
        <DocStatusBadge status={status} />
      </div>

      {/* Uploaded filename */}
      {doc?.originalFilename && (
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{doc.originalFilename}</span>
        </div>
      )}

      {/* Rejection reason */}
      {status === "REJECTED" && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200/60 dark:border-rose-800/40 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Rejected — please re-upload a corrected document.
          </p>
        </div>
      )}

      {/* Actions */}
      {doc && (
        <div className="flex items-center gap-2">
          {/* Download */}
          <a
            href={getDocumentDownloadUrl(doc.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>

          {/* Re-upload */}
          {canUpload && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs gap-1.5"
                disabled={upload.isPending}
                onClick={() => fileRef.current?.click()}
              >
                {upload.isPending
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Uploading…</>
                  : <><Upload className="h-3.5 w-3.5" />Re-upload</>
                }
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
      )}

      {/* Upload button when no doc yet */}
      {!doc && (
        <>
          <Button
            size="sm"
            className="w-full h-9 text-xs gap-1.5"
            disabled={upload.isPending}
            onClick={() => fileRef.current?.click()}
          >
            {upload.isPending
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Uploading…</>
              : <><Upload className="h-3.5 w-3.5" />Upload document</>
            }
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}

// ─── Timeline row ─────────────────────────────────────────────────────────────

function TimelineRow({ event, index }: { event: TimelineEvent; index: number }) {
  const cfg  = EVENT_CFG[event.type];
  const Icon = cfg.icon;
  return (
    <li className="relative flex gap-4 pb-6 animate-fade-up" style={{ animationDelay: `${index * 40}ms` }}>
      <span className={cn("relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-background", cfg.bg)}>
        <Icon className={cn("h-4 w-4", cfg.color)} />
      </span>
      <div className="min-w-0 flex-1 pt-1.5">
        <p className="text-sm font-semibold text-foreground leading-snug">{event.title}</p>
        {event.detail && <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>}
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </li>
  );
}

// ─── Document status badge ────────────────────────────────────────────────────

function DocStatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="secondary" className="text-[10px] flex-shrink-0">Not submitted</Badge>;
  const cfg: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default" | "secondary" }> = {
    VERIFIED:          { label: "Verified",   variant: "success" },
    DIGITAL_RECEIVED:  { label: "Received",   variant: "default" },
    PHYSICAL_RECEIVED: { label: "Received",   variant: "default" },
    REJECTED:          { label: "Rejected",   variant: "destructive" },
    PENDING:           { label: "Pending",    variant: "secondary" },
  };
  const c = cfg[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={c.variant} className="text-[10px] flex-shrink-0">{c.label}</Badge>;
}

function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted animate-float">
        <ClipboardCheck className="h-7 w-7 text-muted-foreground" />
      </span>
      <p className="text-sm font-medium text-foreground">No timeline events yet</p>
      <p className="mt-1 text-xs text-muted-foreground">Events appear as you check in, complete tasks, and submit reports.</p>
    </div>
  );
}
