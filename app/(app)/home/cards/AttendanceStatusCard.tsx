"use client";

import { CheckCircle2, Clock, XCircle, MapPin, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AttendanceRecord } from "@/features/dashboard/dashboard.api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  checkIn:   AttendanceRecord | null;
  checkOut:  AttendanceRecord | null;
  isLoading: boolean;
  className?: string;
}

export function AttendanceStatusCard({ checkIn, checkOut, isLoading, className }: Props) {
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className={cn("h-28 w-full", className)} />;
  }

  const checkedIn  = !!checkIn;
  const checkedOut = !!checkOut;

  return (
    <button
      onClick={() => router.push("/attendance")}
      className={cn(
        "w-full text-left rounded-2xl border border-border/60 bg-card p-4 shadow-card",
        "hover-lift hover-press transition-all",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Today&apos;s attendance
        </p>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        {/* Check-in pill */}
        <AttendancePill
          label="Check in"
          record={checkIn}
          notDoneText="Not checked in"
        />

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* Check-out pill */}
        <AttendancePill
          label="Check out"
          record={checkOut}
          notDoneText="Not checked out"
        />
      </div>

      {/* CTA if neither done yet */}
      {!checkedIn && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
          <MapPin className="h-3.5 w-3.5" />
          Tap to check in now
        </div>
      )}
      {checkedIn && !checkedOut && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          Remember to check out before you leave
        </div>
      )}
      {checkedIn && checkedOut && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          You&apos;re all done for today
        </div>
      )}
    </button>
  );
}

function AttendancePill({
  label,
  record,
  notDoneText,
}: {
  label: string;
  record: AttendanceRecord | null;
  notDoneText: string;
}) {
  const statusConfig = record
    ? {
        ACCEPTED:  { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        FLAGGED:   { icon: AlertTriangle, color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/20" },
        REJECTED:  { icon: XCircle,      color: "text-rose-500",    bg: "bg-rose-50 dark:bg-rose-900/20" },
        CORRECTED: { icon: CheckCircle2, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20" },
      }[record.status]
    : null;

  const Icon = statusConfig?.icon ?? Clock;
  const time = record
    ? new Date(record.submittedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2 py-1",
          statusConfig?.bg ?? "bg-muted",
        )}
      >
        <Icon
          className={cn("h-3.5 w-3.5", statusConfig?.color ?? "text-muted-foreground")}
        />
        <span className={cn("text-xs font-semibold", statusConfig?.color ?? "text-muted-foreground")}>
          {time ?? notDoneText}
        </span>
      </div>
    </div>
  );
}
