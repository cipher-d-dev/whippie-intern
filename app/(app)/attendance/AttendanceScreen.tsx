"use client";

import { useState, useCallback } from "react";
import {
  MapPin, Loader2, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Navigation, Info, UserX,
} from "lucide-react";
import { useTodayAttendance, useAttendanceHistory, useCheckIn } from "@/features/attendance/attendance.hooks";
import { ApiError } from "@/lib/api/client";
import type { AttendanceRecord } from "@/features/attendance/attendance.api";
import type { CheckType, AttendanceStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LocationState = "idle" | "acquiring" | "acquired" | "denied" | "unavailable" | "poor_accuracy" | "submitting";
interface LocationData { latitude: number; longitude: number; accuracy: number; }

export function AttendanceScreen() {
  const { data: todayData, isLoading: todayLoading, error: todayError } = useTodayAttendance();
  const checkIn = useCheckIn();
  const [locState, setLocState] = useState<LocationState>("idle");
  const [locData,  setLocData]  = useState<LocationData | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [histPage, setHistPage] = useState(1);
  const { data: history } = useAttendanceHistory(histPage);

  const noInternRecord = todayError instanceof ApiError && todayError.status === 404;
  const todayRecords = todayData?.data ?? [];
  const checkedIn  = todayRecords.find((r) => r.checkType === "CHECK_IN");
  const checkedOut = todayRecords.find((r) => r.checkType === "CHECK_OUT");
  const pendingType: CheckType = checkedIn ? "CHECK_OUT" : "CHECK_IN";
  const alreadyDone = !!checkedIn && !!checkedOut;

  const acquireLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocState("unavailable"); setLocError("Geolocation not supported."); return; }
    setLocState("acquiring"); setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocData({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setLocState(pos.coords.accuracy > 100 ? "poor_accuracy" : "acquired");
      },
      (err) => {
        setLocState(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
        setLocError(err.code === err.PERMISSION_DENIED
          ? "Location permission denied. Enable it in browser settings."
          : "Could not get your location. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  const handleCheckIn = () => {
    if (!locData) return;
    setLocState("submitting");
    checkIn.mutate(
      { checkType: pendingType, latitude: locData.latitude, longitude: locData.longitude, locationAccuracy: locData.accuracy },
      { onSettled: () => setLocState("idle") },
    );
  };

  if (todayLoading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-2 gap-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-8">
      <div className="animate-fade-up">
        <h1 className="text-[1.6rem] font-black tracking-tight text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {noInternRecord ? (
        <NoInternRecordCard />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 animate-fade-up delay-50">
            <TodayPill type="CHECK_IN"  record={checkedIn  ?? null} />
            <TodayPill type="CHECK_OUT" record={checkedOut ?? null} />
          </div>

          {alreadyDone ? (
            <AllDoneCard className="animate-fade-up delay-100" />
          ) : (
            <CheckInCard
              pendingType={pendingType} locState={locState} locData={locData} locError={locError}
              onAcquire={acquireLocation} onSubmit={handleCheckIn}
              className="animate-fade-up delay-100"
            />
          )}

          <HistoryAccordion
            showHistory={showHistory} setShowHistory={setShowHistory}
            history={history} histPage={histPage} setHistPage={setHistPage}
          />
        </>
      )}
    </div>
  );
}

function NoInternRecordCard() {
  return (
    <div className="rounded-2xl border border-amber-200/60 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/15 p-6 text-center animate-fade-up">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 mx-auto mb-4 animate-float">
        <UserX className="h-7 w-7 text-amber-600 dark:text-amber-400" />
      </div>
      <p className="text-base font-bold text-amber-900 dark:text-amber-200">Account not fully set up</p>
      <p className="mt-2 text-sm text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
        HR needs to create your intern record before attendance is available. This usually happens within your first day.
      </p>
      <p className="mt-3 text-xs text-amber-600/70 dark:text-amber-500/70">
        Contact HR at <span className="font-semibold">hr@whippe.dev</span>
      </p>
    </div>
  );
}

function TodayPill({ type, record }: { type: CheckType; record: AttendanceRecord | null }) {
  const styleMap: Record<AttendanceStatus, string> = {
    ACCEPTED:  "border-emerald-200/60 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    FLAGGED:   "border-amber-200/60 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    REJECTED:  "border-rose-200/60 bg-rose-50 dark:border-rose-800/30 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
    CORRECTED: "border-blue-200/60 bg-blue-50 dark:border-blue-800/30 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  };
  const style = record ? styleMap[record.status] : "";
  return (
    <div className={cn("rounded-2xl border p-4", record ? style : "border-border/60 bg-card")}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {type === "CHECK_IN" ? "Check in" : "Check out"}
      </p>
      {record ? (
        <>
          <p className="text-xl font-black mt-1 tabular-nums">
            {new Date(record.submittedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-[11px] font-semibold mt-0.5">{record.status}</p>
        </>
      ) : (
        <p className="text-sm font-semibold text-muted-foreground mt-1">—</p>
      )}
    </div>
  );
}

function AllDoneCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-emerald-200/60 bg-emerald-50 dark:border-emerald-800/30 dark:bg-emerald-900/15 p-6 text-center", className)}>
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 animate-scale-in" />
      <p className="mt-3 text-base font-bold text-emerald-800 dark:text-emerald-200">All done for today</p>
      <p className="mt-1 text-sm text-emerald-700/70 dark:text-emerald-400/70">Both check-in and check-out recorded.</p>
    </div>
  );
}

function CheckInCard({ pendingType, locState, locData, locError, onAcquire, onSubmit, className }: {
  pendingType: CheckType; locState: LocationState; locData: LocationData | null;
  locError: string | null; onAcquire: () => void; onSubmit: () => void; className?: string;
}) {
  const isAcquiring = locState === "acquiring";
  const isAcquired  = locState === "acquired" || locState === "poor_accuracy";
  const hasError    = locState === "denied" || locState === "unavailable";

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card p-5 shadow-card space-y-4", className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 animate-icon-pop">
          <Navigation className="h-5 w-5 text-primary" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">
            {pendingType === "CHECK_IN" ? "Check in for today" : "Check out for today"}
          </p>
          <p className="text-xs text-muted-foreground">Location verification required</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground leading-snug">
          Your GPS coordinates are verified against the DAAR Communications geofence.
        </p>
      </div>

      {locState === "idle" && (
        <Button className="w-full gap-2" size="lg" onClick={onAcquire}>
          <MapPin className="h-4 w-4" /> Get my location
        </Button>
      )}

      {isAcquiring && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Acquiring GPS signal...</p>
        </div>
      )}

      {locState === "poor_accuracy" && locData && (
        <div className="rounded-xl border border-amber-200/60 bg-amber-50 dark:bg-amber-900/15 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Poor GPS accuracy ({Math.round(locData.accuracy)}m)
            </p>
          </div>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80">May be flagged for HR review. You can still proceed.</p>
        </div>
      )}

      {isAcquired && locData && (
        <div className="space-y-3">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/30 px-3 py-2.5">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              📍 Location acquired · ±{Math.round(locData.accuracy)}m accuracy
            </p>
          </div>
          <Button className="w-full gap-2" size="lg" onClick={onSubmit} disabled={locState === ("submitting" as LocationState)}>
            {locState === ("submitting" as LocationState)
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <CheckCircle2 className="h-4 w-4" />}
            Confirm {pendingType === "CHECK_IN" ? "check in" : "check out"}
          </Button>
          <button onClick={onAcquire} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
            Refresh location
          </button>
        </div>
      )}

      {hasError && (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50 dark:bg-rose-900/15 px-3 py-2.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-rose-500" />
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">Location error</p>
          </div>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80">{locError}</p>
          <button onClick={onAcquire} className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline underline-offset-4">Try again</button>
        </div>
      )}
    </div>
  );
}

function HistoryAccordion({ showHistory, setShowHistory, history, histPage, setHistPage }: {
  showHistory: boolean; setShowHistory: (v: boolean) => void;
  history: any; histPage: number; setHistPage: (fn: (p: number) => number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden animate-fade-up delay-200">
      <button onClick={() => setShowHistory(!showHistory)} className="flex w-full items-center justify-between px-4 py-4 hover-press">
        <p className="text-sm font-semibold text-foreground">Attendance history</p>
        {showHistory ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {showHistory && (
        <div className="border-t border-border/40">
          {!history ? (
            <div className="p-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : history.data.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted-foreground text-center">No records yet.</p>
          ) : (
            <>
              <ul className="divide-y divide-border/40">
                {history.data.map((record: AttendanceRecord, i: number) => <HistoryRow key={record.id} record={record} index={i} />)}
              </ul>
              {history.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                  <button disabled={histPage <= 1} onClick={() => setHistPage(p => p - 1)} className="text-xs font-semibold text-primary disabled:opacity-40">← Prev</button>
                  <span className="text-xs text-muted-foreground">{histPage} / {history.totalPages}</span>
                  <button disabled={histPage >= history.totalPages} onClick={() => setHistPage(p => p + 1)} className="text-xs font-semibold text-primary disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ record, index }: { record: AttendanceRecord; index: number }) {
  const cfg: Record<AttendanceStatus, { icon: React.ElementType; variant: any; label: string }> = {
    ACCEPTED:  { icon: CheckCircle2,  variant: "success",     label: "Accepted" },
    FLAGGED:   { icon: AlertTriangle, variant: "warning",     label: "Flagged" },
    REJECTED:  { icon: XCircle,       variant: "destructive", label: "Rejected" },
    CORRECTED: { icon: CheckCircle2,  variant: "default",     label: "Corrected" },
  };
  const c = cfg[record.status];
  const Icon = c.icon;
  return (
    <li className="flex items-center gap-3 px-4 py-3 animate-fade-up" style={{ animationDelay: `${index * 40}ms` }}>
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{record.checkType === "CHECK_IN" ? "Check in" : "Check out"}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(record.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          {" · "}
          {new Date(record.submittedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <Badge variant={c.variant} className="text-[10px] flex-shrink-0">{c.label}</Badge>
    </li>
  );
}
