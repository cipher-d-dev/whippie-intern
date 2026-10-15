"use client";

import { useState, useCallback } from "react";
import {
  MapPin, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Clock, ChevronDown, ChevronUp, Navigation, Info,
} from "lucide-react";
import { useTodayAttendance, useAttendanceHistory, useCheckIn } from "@/features/attendance/attendance.hooks";
import type { AttendanceRecord } from "@/features/attendance/attendance.api";
import type { CheckType, AttendanceStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Location acquisition state machine ──────────────────────────────────────
type LocationState =
  | "idle"
  | "requesting_permission"
  | "acquiring"
  | "acquired"
  | "denied"
  | "unavailable"
  | "poor_accuracy"
  | "submitting";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AttendanceScreen() {
  const { data: todayData, isLoading: todayLoading } = useTodayAttendance();
  const checkIn = useCheckIn();

  const [locState,  setLocState]  = useState<LocationState>("idle");
  const [locData,   setLocData]   = useState<LocationData | null>(null);
  const [locError,  setLocError]  = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [histPage,  setHistPage]  = useState(1);
  const { data: history } = useAttendanceHistory(histPage);

  const todayRecords = todayData?.data ?? [];
  const checkedIn    = todayRecords.find((r) => r.checkType === "CHECK_IN");
  const checkedOut   = todayRecords.find((r) => r.checkType === "CHECK_OUT");
  const pendingType: CheckType = checkedIn ? "CHECK_OUT" : "CHECK_IN";
  const alreadyDone  = checkedIn && checkedOut;

  const acquireLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocState("unavailable");
      setLocError("Geolocation is not supported by your browser.");
      return;
    }

    setLocState("acquiring");
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const data: LocationData = {
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy:  pos.coords.accuracy,
        };
        setLocData(data);

        if (pos.coords.accuracy > 100) {
          setLocState("poor_accuracy");
        } else {
          setLocState("acquired");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocState("denied");
          setLocError("Location permission denied. Please allow location access in your browser settings.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocState("unavailable");
          setLocError("Location unavailable. Try moving to an area with better signal.");
        } else {
          setLocState("unavailable");
          setLocError("Could not get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const handleCheckIn = () => {
    if (!locData) return;
    setLocState("submitting");
    checkIn.mutate(
      {
        checkType: pendingType,
        latitude:  locData.latitude,
        longitude: locData.longitude,
        locationAccuracy: locData.accuracy,
      },
      {
        onSettled: () => setLocState("idle"),
      }
    );
  };

  if (todayLoading) {
    return (
      <div className="px-4 pt-5 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">

      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">Attendance</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Today's status cards */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-50">
        <TodayPill type="CHECK_IN"  record={checkedIn  ?? null} />
        <TodayPill type="CHECK_OUT" record={checkedOut ?? null} />
      </div>

      {/* Main action area */}
      {alreadyDone ? (
        <AllDoneCard className="animate-fade-up delay-100" />
      ) : (
        <CheckInCard
          pendingType={pendingType}
          locState={locState}
          locData={locData}
          locError={locError}
          onAcquire={acquireLocation}
          onSubmit={handleCheckIn}
          className="animate-fade-up delay-100"
        />
      )}

      {/* History accordion */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden animate-fade-up delay-200">
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3.5 hover-press"
        >
          <p className="text-sm font-semibold text-foreground">Attendance history</p>
          {showHistory
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showHistory && (
          <div>
            {!history ? (
              <div className="px-4 pb-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : history.data.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-muted-foreground text-center py-3">No records yet.</p>
            ) : (
              <>
                <ul className="divide-y divide-border/40 border-t border-border/40">
                  {history.data.map((record, i) => (
                    <HistoryRow key={record.id} record={record} index={i} />
                  ))}
                </ul>
                {/* Simple pagination */}
                {history.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                    <button
                      disabled={histPage <= 1}
                      onClick={() => setHistPage((p) => p - 1)}
                      className="text-xs font-medium text-primary disabled:opacity-40"
                    >
                      ← Previous
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Page {histPage} of {history.totalPages}
                    </span>
                    <button
                      disabled={histPage >= history.totalPages}
                      onClick={() => setHistPage((p) => p + 1)}
                      className="text-xs font-medium text-primary disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TodayPill({ type, record }: { type: CheckType; record: AttendanceRecord | null }) {
  const done = !!record;
  const statusColors: Record<AttendanceStatus, string> = {
    ACCEPTED:  "text-emerald-500",
    FLAGGED:   "text-amber-500",
    REJECTED:  "text-rose-500",
    CORRECTED: "text-blue-500",
  };

  return (
    <div className={cn(
      "rounded-2xl border p-3.5",
      done
        ? record!.status === "ACCEPTED" || record!.status === "CORRECTED"
          ? "border-emerald-200/60 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-900/15"
          : record!.status === "FLAGGED"
          ? "border-amber-200/60 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/15"
          : "border-rose-200/60 bg-rose-50 dark:border-rose-800/30 dark:bg-rose-900/15"
        : "border-border/60 bg-card",
    )}>
      <p className="text-xs text-muted-foreground">{type === "CHECK_IN" ? "Check in" : "Check out"}</p>
      {done ? (
        <>
          <p className={cn("text-base font-extrabold mt-0.5", statusColors[record!.status])}>
            {new Date(record!.submittedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className={cn("text-[10px] font-medium mt-0.5", statusColors[record!.status])}>
            {record!.status}
          </p>
        </>
      ) : (
        <p className="text-sm font-semibold text-muted-foreground mt-0.5">Pending</p>
      )}
    </div>
  );
}

function AllDoneCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-emerald-200/60 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-900/15 p-6 text-center", className)}>
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 animate-scale-in" />
      <p className="mt-3 text-base font-bold text-emerald-800 dark:text-emerald-200">All done for today!</p>
      <p className="mt-1 text-xs text-emerald-700/70 dark:text-emerald-400/70">
        Both check-in and check-out recorded.
      </p>
    </div>
  );
}

function CheckInCard({
  pendingType, locState, locData, locError, onAcquire, onSubmit, className,
}: {
  pendingType: CheckType;
  locState: LocationState;
  locData: LocationData | null;
  locError: string | null;
  onAcquire: () => void;
  onSubmit: () => void;
  className?: string;
}) {
  const isAcquiring = locState === "acquiring";
  const isAcquired  = locState === "acquired" || locState === "poor_accuracy";
  const hasError    = locState === "denied" || locState === "unavailable";

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card shadow-card p-5 space-y-4", className)}>
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 animate-icon-pop">
          <Navigation className="h-5 w-5 text-primary" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">
            {pendingType === "CHECK_IN" ? "Check in" : "Check out"}
          </p>
          <p className="text-xs text-muted-foreground">Location verification required</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground leading-snug">
          Your location is sent to the server for verification. The server confirms whether you are
          within the DAAR Communications office geofence.
        </p>
      </div>

      {/* Location status */}
      {locState === "idle" && (
        <Button className="w-full gap-2" size="lg" onClick={onAcquire}>
          <MapPin className="h-4 w-4" />
          Get my location
        </Button>
      )}

      {isAcquiring && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Acquiring GPS signal...</p>
        </div>
      )}

      {locState === "poor_accuracy" && locData && (
        <div className="rounded-xl border border-amber-200/60 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/15 px-3 py-2.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Poor GPS accuracy ({Math.round(locData.accuracy)}m)</p>
          </div>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
            Your check-in may be flagged for HR review. You can still proceed.
          </p>
        </div>
      )}

      {isAcquired && locData && (
        <div className="space-y-3">
          <div className="rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">
              📍 Location acquired · Accuracy: {Math.round(locData.accuracy)}m
            </p>
          </div>
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={onSubmit}
            disabled={locState === "submitting" as any}
          >
            {locState === "submitting" as any
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <CheckCircle2 className="h-4 w-4" />}
            Confirm {pendingType === "CHECK_IN" ? "check in" : "check out"}
          </Button>
          <button
            onClick={onAcquire}
            className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Refresh location
          </button>
        </div>
      )}

      {hasError && (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50 dark:border-rose-800/30 dark:bg-rose-900/15 px-3 py-2.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-rose-500" />
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">Location error</p>
          </div>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80">{locError}</p>
          <button onClick={onAcquire} className="text-xs font-semibold text-rose-700 dark:text-rose-300 underline-offset-4 hover:underline">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function HistoryRow({ record, index }: { record: AttendanceRecord; index: number }) {
  const statusConfig: Record<AttendanceStatus, { icon: React.ElementType; color: string; label: string }> = {
    ACCEPTED:  { icon: CheckCircle2,  color: "text-emerald-500", label: "Accepted" },
    FLAGGED:   { icon: AlertTriangle, color: "text-amber-500",   label: "Flagged" },
    REJECTED:  { icon: XCircle,       color: "text-rose-500",    label: "Rejected" },
    CORRECTED: { icon: CheckCircle2,  color: "text-blue-500",    label: "Corrected" },
  };
  const cfg  = statusConfig[record.status];
  const Icon = cfg.icon;

  return (
    <li
      className="flex items-center gap-3 px-4 py-3 animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted")}>
        <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {record.checkType === "CHECK_IN" ? "Check in" : "Check out"}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(record.submittedAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          })} · {new Date(record.submittedAt).toLocaleTimeString("en-GB", {
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>
      <Badge
        variant={record.status === "ACCEPTED" || record.status === "CORRECTED" ? "success" : record.status === "FLAGGED" ? "warning" : "destructive"}
        className="text-[10px]"
      >
        {cfg.label}
      </Badge>
    </li>
  );
}
