"use client";

import { useRef, useState } from "react";
import {
  ClipboardCheck, ClipboardList, CheckCircle2,
  FileText, Star, FolderOpen, Upload, Loader2,
  Download, FileCheck2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMyInternRecord } from "@/features/dashboard/dashboard.hooks";
import { apiGetTimeline, type TimelineEventType, type TimelineEvent } from "@/features/timeline/timeline.api";
import { useDocumentChecklist, useUploadDocument } from "@/features/documents/documents.hooks";
import { getDocumentDownloadUrl, type ChecklistItem } from "@/features/documents/documents.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
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
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Activity & Documents</h1>
          <ThemeToggle />
        </div>

        {/* Tab switcher */}
        <div className="mt-3 flex rounded-xl bg-muted/60 p-1 border border-border/40 gap-1">
          {(["timeline", "documents"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 capitalize",
                tab === t
                  ? "bg-card text-foreground shadow-xs border border-border/50 font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "timeline" ? "Milestones" : "Documents"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {tab === "timeline" ? (
          <TimelineTab
            timeline={timeline}
            isLoading={timelineLoading}
            page={page}
            setPage={setPage}
          />
        ) : (
          <DocumentsTab checklist={checklist} isLoading={docsLoading} internId={intern?.id} />
        )}
      </div>
    </div>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({
  timeline,
  isLoading,
  page,
  setPage,
}: {
  timeline: { data: TimelineEvent[]; totalPages: number } | undefined;
  isLoading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const events = timeline?.data ?? [];

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/70 mb-3">
          <ClipboardList className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-semibold text-foreground">No activity recorded yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
          Your daily check-ins, task completions, and evaluations will be tracked here sequentially.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-[11px] before:w-[2px] before:bg-border/60">
        {events.map((evt, idx) => {
          const cfg = EVENT_CFG[evt.type] ?? {
            icon: ClipboardList,
            color: "text-muted-foreground",
            bg: "bg-muted",
          };
          const Icon = cfg.icon;

          return (
            <div key={evt.refId ?? idx} className="relative flex items-start gap-3">
              {/* Timeline marker */}
              <div
                className={cn(
                  "absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background ring-1 ring-border/80 shadow-xs",
                  cfg.bg,
                )}
              >
                <Icon className={cn("h-3 w-3", cfg.color)} />
              </div>

              {/* Event card */}
              <div className="flex-1 rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-foreground">{evt.title}</h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(evt.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                {evt.detail && (
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {evt.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {timeline && timeline.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 text-xs rounded-xl"
          >
            Previous
          </Button>
          <span>Page {page} of {timeline.totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= timeline.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 text-xs rounded-xl"
          >
            Next
          </Button>
        </div>
      )}
    </div>
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = checklist ?? [];

  return (
    <div className="space-y-4 animate-fade-up">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-3.5 text-xs text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Required Program Documents: </span>
        Please provide official credentials, introduction letters, and signed agreements. Files are stored securely.
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isUploaded = !!item.document;
          const status = item.document?.status ?? "PENDING";
          const docId = item.document?.id ?? item.requirement.id;

          return (
            <div
              key={item.requirement.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isUploaded
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {isUploaded ? <FileCheck2 className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {item.requirement.label}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {item.requirement.isRequired ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Mandatory</span>
                    ) : (
                      "Optional"
                    )}
                    {item.document?.originalFilename && ` · ${item.document.originalFilename}`}
                  </p>
                </div>
              </div>

              <div>
                {isUploaded && item.document ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={status === "VERIFIED" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      asChild
                    >
                      <a
                        href={getDocumentDownloadUrl(item.document.id)}
                        target="_blank"
                        rel="noreferrer"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectFile(docId)}
                    disabled={uploadDoc.isPending}
                    className="h-8 rounded-xl text-xs gap-1 font-semibold"
                  >
                    {uploadDoc.isPending && selectedDocId === docId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Upload
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
