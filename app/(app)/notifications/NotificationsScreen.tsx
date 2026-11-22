"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Bell, CheckCircle2, ClipboardList, FileText, FolderOpen, Loader2, Star, UserCheck } from "lucide-react";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/features/notifications/notifications.hooks";
import type { Notification } from "@/features/notifications/notifications.api";
import type { NotificationType } from "@/types";
import { fmtWhen } from "@/lib/format";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Icon, tone and where tapping goes, per notification type. */
type Cfg = { icon: React.ElementType; tone?: "success" | "warning" | "danger"; route?: (id?: string) => string | null };

const CONFIG: Partial<Record<NotificationType, Cfg>> = {
  TASK_ASSIGNED:                { icon: ClipboardList, route: (id) => (id ? `/tasks/${id}` : "/tasks") },
  TASK_FEEDBACK:                { icon: ClipboardList, tone: "warning", route: (id) => (id ? `/tasks/${id}` : "/tasks") },
  SUBMISSION_APPROVED:          { icon: CheckCircle2, tone: "success", route: (id) => (id ? `/tasks/${id}` : "/tasks") },
  SUBMISSION_CHANGES_REQUESTED: { icon: AlertCircle, tone: "warning", route: (id) => (id ? `/tasks/${id}` : "/tasks") },
  EVALUATION_SUBMITTED:         { icon: Star, route: (id) => (id ? `/evaluations/${id}` : "/evaluations") },
  REPORT_REVIEWED:              { icon: FileText, tone: "success", route: (id) => (id ? `/reports/${id}` : "/reports") },
  ACCOUNT_APPROVED:             { icon: CheckCircle2, tone: "success" },
  ACCOUNT_REJECTED:             { icon: AlertCircle, tone: "danger" },
  SUPERVISOR_ASSIGNED:          { icon: UserCheck, route: () => "/profile" },
  DOCUMENT_STATUS_CHANGED:      { icon: FolderOpen, route: () => "/timeline" },
};

const TONE = {
  success: "bg-success-soft text-success-foreground",
  warning: "bg-warning-soft text-warning-foreground",
  danger:  "bg-danger-soft text-danger-foreground",
};

export function NotificationsScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useNotifications(page);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  const open = (n: Notification) => {
    const id = n.id || n._id;
    if (!n.read && id) markRead.mutate(id);
    const to = CONFIG[n.type]?.route?.(n.relatedEntity?.id);
    if (to) router.push(to);
  };

  const today = new Date().toDateString();
  const groups = [
    { label: "Today", items: notifications.filter((n) => new Date(n.createdAt).toDateString() === today) },
    { label: "Earlier", items: notifications.filter((n) => new Date(n.createdAt).toDateString() !== today) },
  ].filter((g) => g.items.length);

  return (
    <div className="animate-fade-in">
      <SubHeader
        title="Notifications"
        backHref="/home"
        action={
          unread > 0 ? (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="whitespace-nowrap text-[13px] font-medium text-primary hover:underline disabled:opacity-50"
            >
              {markAllRead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark all read"}
            </button>
          ) : undefined
        }
      />

      <div className="space-y-4 px-5 pb-6 pt-1">
        {isLoading ? (
          <Skeleton className="h-72 rounded-2xl" />
        ) : isError ? (
          <Card className="p-6 text-center">
            <p className="font-medium">Couldn&apos;t load notifications</p>
            <button onClick={() => refetch()} className="mt-2 text-sm font-medium text-primary hover:underline">Try again</button>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="px-6 py-12 text-center">
            <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 font-medium">You&apos;re all caught up</p>
            <p className="mt-1 text-sm text-muted-foreground">New tasks, feedback and updates from HR will show up here.</p>
          </Card>
        ) : (
          groups.map((g) => (
            <section key={g.label} aria-label={g.label}>
              <h2 className="px-1 pb-2 text-[13px] font-medium text-muted-foreground">{g.label}</h2>
              <Card className="overflow-hidden">
                <ul className="divide-y">
                  {g.items.map((n, i) => <Row key={n.id || n._id || `${n.createdAt}-${i}`} n={n} onOpen={() => open(n)} />)}
                </ul>
              </Card>
            </section>
          ))
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Newer</Button>
            <span className="font-mono">{page} / {data.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Older</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ n, onOpen }: { n: Notification; onOpen: () => void }) {
  const cfg: Cfg = CONFIG[n.type] ?? { icon: Bell };
  const Icon = cfg.icon;
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 px-[18px] py-3.5 text-left hover:bg-muted/50">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", cfg.tone ? TONE[cfg.tone] : "bg-muted text-muted-foreground")}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</span>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{fmtWhen(n.createdAt)}</span>
          </span>
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-muted-foreground">{n.body}</span>
        </span>
        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"><span className="sr-only">Unread</span></span>}
      </button>
    </li>
  );
}
