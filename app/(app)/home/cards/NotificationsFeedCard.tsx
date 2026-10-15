"use client";

import { Bell, ChevronRight, CheckCircle2, ClipboardList, Star, FileText, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { NotificationItem } from "@/features/dashboard/dashboard.api";
import type { NotificationType } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  notifications: NotificationItem[];
  className?: string;
}

const notifIcon: Partial<Record<NotificationType, React.ElementType>> = {
  ACCOUNT_APPROVED:              CheckCircle2,
  TASK_ASSIGNED:                 ClipboardList,
  TASK_FEEDBACK:                 ClipboardList,
  SUBMISSION_APPROVED:           CheckCircle2,
  SUBMISSION_CHANGES_REQUESTED:  AlertCircle,
  EVALUATION_SUBMITTED:          Star,
  REPORT_REVIEWED:               FileText,
  SUPERVISOR_ASSIGNED:           CheckCircle2,
  DOCUMENT_STATUS_CHANGED:       FileText,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationsFeedCard({ notifications, className }: Props) {
  const router = useRouter();

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card shadow-card", className)}>
      {/* Header */}
      <button
        onClick={() => router.push("/notifications")}
        className="flex w-full items-center justify-between px-4 pt-4 pb-3 hover-press"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 animate-icon-pop">
            <Bell className="h-4 w-4 text-primary" />
          </span>
          <p className="text-sm font-semibold text-foreground">Recent notifications</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </button>

      {notifications.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground text-center py-3">
          No notifications yet
        </p>
      ) : (
        <ul className="divide-y divide-border/40 border-t border-border/40">
          {notifications.map((n, i) => {
            const Icon = notifIcon[n.type] ?? Bell;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3",
                  !n.read && "bg-primary/[0.03]",
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg",
                    n.read ? "bg-muted" : "bg-primary/10",
                  )}
                >
                  <Icon
                    className={cn("h-3.5 w-3.5", n.read ? "text-muted-foreground" : "text-primary")}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm leading-snug", n.read ? "text-muted-foreground" : "font-medium text-foreground")}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>
                </div>
                <span className="flex-shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
                  {timeAgo(n.createdAt)}
                </span>
                {!n.read && (
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary animate-pulse-dot" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
