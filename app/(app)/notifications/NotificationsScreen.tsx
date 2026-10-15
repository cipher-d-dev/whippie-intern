"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCheck, CheckCircle2, ClipboardList,
  Star, FileText, AlertCircle, Loader2,
} from "lucide-react";
import {
  useNotifications, useMarkRead, useMarkAllRead,
} from "@/features/notifications/notifications.hooks";
import type { Notification } from "@/features/notifications/notifications.api";
import type { NotificationType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Icon + nav routing per notification type ─────────────────────────────────

const NOTIF_CONFIG: Partial<Record<NotificationType, {
  icon: React.ElementType;
  color: string;
  bg: string;
  route?: (id: string) => string;
}>> = {
  TASK_ASSIGNED:               { icon: ClipboardList, color: "text-primary",      bg: "bg-primary/10",                       route: (id) => `/tasks/${id}` },
  TASK_FEEDBACK:               { icon: ClipboardList, color: "text-amber-500",    bg: "bg-amber-50 dark:bg-amber-900/20",    route: (id) => `/tasks/${id}` },
  SUBMISSION_APPROVED:         { icon: CheckCircle2,  color: "text-emerald-500",  bg: "bg-emerald-50 dark:bg-emerald-900/20",route: (id) => `/tasks/${id}` },
  SUBMISSION_CHANGES_REQUESTED:{ icon: AlertCircle,   color: "text-amber-500",    bg: "bg-amber-50 dark:bg-amber-900/20",    route: (id) => `/tasks/${id}` },
  EVALUATION_SUBMITTED:        { icon: Star,          color: "text-violet-500",   bg: "bg-violet-50 dark:bg-violet-900/20" },
  REPORT_REVIEWED:             { icon: FileText,      color: "text-blue-500",     bg: "bg-blue-50 dark:bg-blue-900/20",      route: (id) => `/reports/${id}` },
  ACCOUNT_APPROVED:            { icon: CheckCircle2,  color: "text-emerald-500",  bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  ACCOUNT_REJECTED:            { icon: AlertCircle,   color: "text-rose-500",     bg: "bg-rose-50 dark:bg-rose-900/20" },
  SUPERVISOR_ASSIGNED:         { icon: CheckCircle2,  color: "text-blue-500",     bg: "bg-blue-50 dark:bg-blue-900/20" },
  DOCUMENT_STATUS_CHANGED:     { icon: FileText,      color: "text-muted-foreground", bg: "bg-muted" },
};

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationsScreen() {
  const router      = useRouter();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useNotifications(page, filter === "unread" ? false : undefined);
  const markRead    = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unreadCount   = notifications.filter((n) => !n.read).length;

  const handleTap = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id);
    const cfg   = NOTIF_CONFIG[n.type];
    const route = cfg?.route && n.relatedEntity?.id ? cfg.route(n.relatedEntity.id) : null;
    if (route) router.push(route);
  };

  return (
    <div className="flex flex-col pb-4">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between animate-fade-up">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              {markAllRead.isPending
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <CheckCheck className="h-3.5 w-3.5" />}
              Mark all read
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mt-3 flex rounded-2xl bg-muted p-1 gap-1">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200 capitalize",
                filter === f
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div>
        {isLoading ? (
          <div className="px-4 pt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <ul className="divide-y divide-border/40">
            {notifications.map((n, i) => (
              <NotifRow key={n.id} notification={n} index={i} onTap={() => handleTap(n)} />
            ))}
          </ul>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-border/40">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs font-medium text-primary disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-xs text-muted-foreground">
              {page} / {data.totalPages}
            </span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs font-medium text-primary disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotifRow({ notification: n, index, onTap }: {
  notification: Notification;
  index: number;
  onTap: () => void;
}) {
  const cfg  = NOTIF_CONFIG[n.type] ?? { icon: Bell, color: "text-muted-foreground", bg: "bg-muted" };
  const Icon = cfg.icon;
  const tappable = !!NOTIF_CONFIG[n.type]?.route;

  return (
    <li
      role={tappable ? "button" : undefined}
      onClick={tappable ? onTap : undefined}
      className={cn(
        "flex items-start gap-3 px-4 py-4 transition-colors animate-fade-up",
        !n.read && "bg-primary/[0.03]",
        tappable && "cursor-pointer hover:bg-muted/40 active:bg-muted/60",
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Icon */}
      <span className={cn("mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
        <Icon className={cn("h-4 w-4", cfg.color)} />
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className={cn(
          "text-sm leading-snug",
          n.read ? "text-muted-foreground" : "font-semibold text-foreground",
        )}>
          {n.title}
        </p>
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{n.body}</p>
        <p className="text-[10px] text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!n.read && (
        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary animate-pulse-dot" />
      )}
    </li>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: "all" | "unread" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up px-4">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted animate-float">
        <Bell className="h-7 w-7 text-muted-foreground" />
      </span>
      <p className="text-sm font-medium text-foreground">
        {filter === "unread" ? "No unread notifications" : "No notifications yet"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {filter === "unread"
          ? "You're all caught up!"
          : "Notifications about tasks, evaluations, and updates will appear here."}
      </p>
    </div>
  );
}
