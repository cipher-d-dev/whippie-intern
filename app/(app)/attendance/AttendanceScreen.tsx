"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Check, Loader2, LocateFixed, MapPinOff, RefreshCw, ScanFace, TriangleAlert, X } from "lucide-react";
import { useAttendanceHistory, useCheckIn, useGeofence, useTodayAttendance } from "@/features/attendance/attendance.hooks";
import type { AttendanceRecord, Geofence } from "@/features/attendance/attendance.api";
import type { CheckType } from "@/types";
import { ApiError } from "@/lib/api/client";
import { distanceMeters, offsetMeters } from "@/lib/geo";
import { fmtDuration, fmtMeters, fmtTime } from "@/lib/format";
import { TabHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaceCapture, type FaceCaptureResult } from "@/components/face/FaceCapture";
import { needsFacePhoto, useMyFace, FACE_KEY } from "@/features/face/face";
import { deviceId } from "@/lib/face/human";
import { useQueryClient } from "@tanstack/react-query";

type Fix = { latitude: number; longitude: number; accuracy: number; at: number };
type LocState = "idle" | "acquiring" | "ready" | "denied" | "unavailable";

/** inside / weak / outside / unknown: what the server is likely to decide. */
type Verdict = "inside" | "weak" | "outside" | "unknown";

export function AttendanceScreen() {
  const { data: todayData, isLoading: todayLoading, isFetching, error: todayError } = useTodayAttendance();
  const { data: geofence, isError: geofenceError } = useGeofence();
  const { data: history } = useAttendanceHistory(1);
  const checkIn = useCheckIn();
  const qc = useQueryClient();
  const { data: face } = useMyFace();
  const [camera, setCamera] = useState(false);
  const [cameraSkipped, setCameraSkipped] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);

  const [loc, setLoc] = useState<LocState>("idle");
  const [fix, setFix] = useState<Fix | null>(null);

  const noInternRecord = todayError instanceof ApiError && todayError.status === 404;
  const today = todayData?.data ?? [];
  const checkedIn = today.find((r) => r.checkType === "CHECK_IN") ?? null;
  const checkedOut = today.find((r) => r.checkType === "CHECK_OUT") ?? null;
  const pendingType: CheckType = checkedIn ? "CHECK_OUT" : "CHECK_IN";
  const allDone = !!checkedIn && !!checkedOut;

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLoc("unavailable");
      return;
    }
    setLoc("acquiring");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFix({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, at: Date.now() });
        setLoc("ready");
      },
      (err) => setLoc(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }, []);

  // If location permission was already granted, find the intern straight away.
  useEffect(() => {
    if (allDone || noInternRecord || todayLoading) return;
    let cancelled = false;
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((p) => { if (!cancelled && p.state === "granted") locate(); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [allDone, noInternRecord, todayLoading, locate]);

  const distance = fix && geofence ? distanceMeters(geofence, fix) : null;
  const verdict: Verdict =
    !fix || !geofence || distance === null
      ? "unknown"
      : distance > geofence.radiusMeters
        ? "outside"
        : fix.accuracy > geofence.poorAccuracyThresholdMeters
          ? "weak"
          : "inside";

  const submit = () => {
    if (!fix) return;
    // Check-out always asks first.
    if (pendingType === "CHECK_OUT" && !confirmOut) {
      setConfirmOut(true);
      return;
    }
    // With face check on, a check-in starts with a live selfie.
    if (pendingType === "CHECK_IN" && face?.required) {
      setCamera(true);
      return;
    }
    send();
  };

  const send = (selfie?: FaceCaptureResult) => {
    if (!fix) return;
    checkIn.mutate(
      {
        checkType: pendingType,
        latitude: fix.latitude,
        longitude: fix.longitude,
        locationAccuracy: fix.accuracy,
        face: selfie,
        deviceId: deviceId(),
      },
      // 412 = HR asked for a new face photo since this screen loaded.
      {
        // Forget the location after a check-in/out, so a second tap on the same
        // spot can't immediately send a check-out (interns reported this).
        onSuccess: () => { setFix(null); setLoc("idle"); setConfirmOut(false); },
        onError: (err) => { if (err instanceof ApiError && err.status === 412) qc.invalidateQueries({ queryKey: FACE_KEY }); },
      },
    );
  };

  const dateLabel = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  if (todayLoading) {
    return (
      <div>
        <TabHeader title="Check in" aside={<span className="font-mono">{dateLabel}</span>} />
        <div className="space-y-3 px-5">
          <Skeleton className="h-[380px] rounded-2xl" />
          <Skeleton className="h-[52px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TabHeader title="Check in" aside={<span className="font-mono">{dateLabel}</span>} />

      <div className="flex flex-col gap-3.5 px-5">
        {noInternRecord ? (
          <NotSetUp />
        ) : allDone ? (
          <DayComplete checkIn={checkedIn!} checkOut={checkedOut!} />
        ) : (
          <>
            {checkedIn && <OnSite record={checkedIn} />}

            <Card className="p-[18px]">
              <ZoneMap geofence={geofence} fix={fix} verdict={verdict} loc={loc} />

              <div className="mt-4 flex justify-center">
                <VerdictChip verdict={verdict} loc={loc} distance={distance} geofence={geofence} fix={fix} geofenceError={geofenceError} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2.5">
                <Stat label="Distance" value={distance !== null ? fmtMeters(distance) : "—"} />
                <Stat label="GPS accuracy" value={fix ? `±${Math.round(fix.accuracy)} m` : "—"} />
              </dl>
            </Card>

            {pendingType === "CHECK_IN" && needsFacePhoto(face) ? (
              <Card className="p-[18px] text-center">
                <ScanFace className="mx-auto h-7 w-7 text-primary" />
                <p className="mt-2 font-semibold">{face?.status === "REJECTED" ? "HR asked for a new face photo" : "Take your face photo first"}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {face?.status === "REJECTED" && face.rejectionReason ? face.rejectionReason : "It takes a few seconds. You can check in straight after."}
                </p>
                <Button size="lg" className="mt-4 w-full" asChild><Link href="/face">Take face photo</Link></Button>
              </Card>
            ) : (
              <>
                {confirmOut && checkedIn ? (
                  <Card className="p-[18px]">
                    <p className="font-semibold">Check out for today?</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      You checked in at {fmtTime(checkedIn.submittedAt)}. Leaving early is fine; you just can&apos;t undo a check-out.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <Button variant="outline" onClick={() => setConfirmOut(false)} disabled={checkIn.isPending}>Not yet</Button>
                      <Button onClick={() => send()} disabled={checkIn.isPending}>
                        {checkIn.isPending && <Loader2 className="animate-spin" />} Yes, check out
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <PrimaryAction
                    loc={loc}
                    verdict={verdict}
                    pendingType={pendingType}
                    pending={checkIn.isPending || isFetching}
                    onLocate={locate}
                    onSubmit={submit}
                  />
                )}
                <Hint loc={loc} verdict={verdict} pendingType={pendingType} hasFix={!!fix} onRefresh={locate} />
                {pendingType === "CHECK_IN" && face?.required && cameraSkipped && fix && (
                  <button type="button" onClick={() => send()} disabled={checkIn.isPending} className="-mt-1 text-center text-[13px] font-medium text-primary hover:underline">
                    Camera not working? Check in without a selfie (HR will review it)
                  </button>
                )}
              </>
            )}
          </>
        )}

        {!noInternRecord && <ThisWeek records={history?.data ?? []} />}
      </div>

      {camera && (
        <FaceCapture
          title="Check-in selfie"
          onCancel={() => { setCamera(false); setCameraSkipped(true); }}
          onDone={(r) => { setCamera(false); send(r); }}
        />
      )}
    </div>
  );
}

// ─── Map ──────────────────────────────────────────────────────────────────────

const VIEW = 220; // px, square
const ZONE_PX = 62; // radius of the office zone on screen

function ZoneMap({ geofence, fix, verdict, loc }: { geofence?: Geofence; fix: Fix | null; verdict: Verdict; loc: LocState }) {
  const dot = useMemo(() => {
    if (!geofence || !fix) return null;
    const { x, y } = offsetMeters(geofence, fix);
    const pxPerMeter = ZONE_PX / geofence.radiusMeters;
    let dx = x * pxPerMeter;
    let dy = -y * pxPerMeter;
    const max = VIEW / 2 - 14;
    const len = Math.hypot(dx, dy);
    const clamped = len > max;
    if (clamped) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    return { dx, dy, clamped, accuracyPx: Math.min(VIEW / 2, fix.accuracy * pxPerMeter) };
  }, [geofence, fix]);

  const dotColour =
    verdict === "outside" ? "bg-danger" : verdict === "weak" ? "bg-warning" : "bg-primary";

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-full border border-dashed border-primary/30 bg-accent/60"
      style={{ width: VIEW, height: VIEW }}
      role="img"
      aria-label={
        !fix ? "Office zone. Your location is not known yet."
        : verdict === "outside" ? "You are outside the office zone."
        : "You are inside the office zone."
      }
    >
      {/* Office zone */}
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 ring-1 ring-primary/25"
        style={{ width: ZONE_PX * 2, height: ZONE_PX * 2 }}
      />
      <span
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 text-[11px] font-medium text-accent-foreground"
        style={{ top: VIEW / 2 - ZONE_PX + 10 }}
      >
        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
        Office zone
      </span>
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-foreground/50" aria-hidden="true" />

      {loc === "acquiring" && (
        <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 animate-pulse-ring" />
      )}

      {dot && (
        <span className="absolute left-1/2 top-1/2" style={{ transform: `translate(${dot.dx}px, ${dot.dy}px)` }}>
          {!dot.clamped && (
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15"
              style={{ width: dot.accuracyPx * 2, height: dot.accuracyPx * 2 }}
            />
          )}
          <span className={cn("absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-card shadow", dotColour)} />
          <span className="absolute left-3 top-1 whitespace-nowrap rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-semibold text-background">
            You
          </span>
        </span>
      )}
    </div>
  );
}

function VerdictChip({
  verdict, loc, distance, geofence, fix, geofenceError,
}: {
  verdict: Verdict; loc: LocState; distance: number | null; geofence?: Geofence; fix: Fix | null; geofenceError: boolean;
}) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium";
  if (loc === "acquiring") {
    return <span className={cn(base, "bg-muted text-muted-foreground")}><Loader2 className="h-4 w-4 animate-spin" /> Finding you…</span>;
  }
  if (loc === "denied") {
    return <span className={cn(base, "bg-danger-soft text-danger-foreground")}><MapPinOff className="h-4 w-4" /> Location is turned off</span>;
  }
  if (loc === "unavailable") {
    return <span className={cn(base, "bg-danger-soft text-danger-foreground")}><MapPinOff className="h-4 w-4" /> Couldn&apos;t get your location</span>;
  }
  if (fix && (geofenceError || !geofence)) {
    return <span className={cn(base, "bg-muted text-secondary-foreground")}><LocateFixed className="h-4 w-4" /> Location found</span>;
  }
  if (verdict === "inside") {
    return <span className={cn(base, "bg-success-soft text-success-foreground")}><Check className="h-4 w-4" /> Inside the office zone</span>;
  }
  if (verdict === "weak") {
    return <span className={cn(base, "bg-warning-soft text-warning-foreground")}><TriangleAlert className="h-4 w-4" /> Inside, but the GPS signal is weak</span>;
  }
  if (verdict === "outside" && distance !== null && geofence) {
    return (
      <span className={cn(base, "bg-danger-soft text-danger-foreground")}>
        <X className="h-4 w-4" /> {fmtMeters(distance - geofence.radiusMeters)} outside the zone
      </span>
    );
  }
  return <span className={cn(base, "bg-muted text-muted-foreground")}><LocateFixed className="h-4 w-4" /> We need your location</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3.5 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-lg font-medium tabular">{value}</dd>
    </div>
  );
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function PrimaryAction({
  loc, verdict, pendingType, pending, onLocate, onSubmit,
}: {
  loc: LocState; verdict: Verdict; pendingType: CheckType; pending: boolean; onLocate: () => void; onSubmit: () => void;
}) {
  const word = pendingType === "CHECK_IN" ? "Check in" : "Check out";

  if (loc === "idle" || loc === "denied" || loc === "unavailable") {
    return (
      <Button size="lg" className="w-full" onClick={onLocate}>
        <LocateFixed /> {loc === "idle" ? "Find my location" : "Try again"}
      </Button>
    );
  }
  if (loc === "acquiring") {
    return <Button size="lg" className="w-full" disabled><Loader2 className="animate-spin" /> Finding you…</Button>;
  }
  if (verdict === "outside") {
    return (
      <Button size="lg" variant="outline" className="w-full" onClick={onSubmit} disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} {word} anyway
      </Button>
    );
  }
  return (
    <Button size="lg" className="w-full" onClick={onSubmit} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Check />} {word}
    </Button>
  );
}

function Hint({
  loc, verdict, pendingType, hasFix, onRefresh,
}: {
  loc: LocState; verdict: Verdict; pendingType: CheckType; hasFix: boolean; onRefresh: () => void;
}) {
  let text: string;
  if (loc === "idle") text = "We only read your location when you tap, to check you're at the office.";
  else if (loc === "denied") text = "Allow location for this site in your browser settings, then try again.";
  else if (loc === "unavailable") text = "Move closer to a window or turn on Wi-Fi to help your phone find you.";
  else if (loc === "acquiring") text = "This usually takes a few seconds.";
  else if (verdict === "outside") text = "It will be recorded as outside the zone. If you are at the office, HR can correct it.";
  else if (verdict === "weak") text = "Step outside or near a window for a better signal, or go ahead and HR will review it.";
  else text = pendingType === "CHECK_IN" ? "Your check-in time is recorded when you tap." : "Remember to check out before you leave.";

  return (
    <div className="-mt-1 flex items-start justify-center gap-3 px-2 text-center text-[13px] leading-snug text-muted-foreground">
      <p>{text}</p>
      {hasFix && loc === "ready" && (
        <button type="button" onClick={onRefresh} className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      )}
    </div>
  );
}

// ─── Day state cards ──────────────────────────────────────────────────────────

function OnSite({ record }: { record: AttendanceRecord }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return (
    <Card className="flex items-center justify-between gap-3 px-[18px] py-4">
      <div>
        <p className="text-[13px] text-muted-foreground">Checked in</p>
        <p className="font-mono text-2xl font-medium tabular">{fmtTime(record.submittedAt)}</p>
        <p className="text-[13px] text-muted-foreground">On site for {fmtDuration(now - new Date(record.submittedAt).getTime())}</p>
      </div>
      <StatusBadge status={record.status} />
    </Card>
  );
}

function DayComplete({ checkIn, checkOut }: { checkIn: AttendanceRecord; checkOut: AttendanceRecord }) {
  const span = new Date(checkOut.submittedAt).getTime() - new Date(checkIn.submittedAt).getTime();
  return (
    <Card className="p-[18px]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success-soft text-success-foreground">
          <Check className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-semibold">You&apos;re done for today</p>
          <p className="text-[13px] text-muted-foreground">{fmtDuration(span)} on site</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2.5">
        {[checkIn, checkOut].map((r) => (
          <div key={r.checkType} className="rounded-xl bg-muted px-3.5 py-3">
            <dt className="text-xs text-muted-foreground">{r.checkType === "CHECK_IN" ? "In" : "Out"}</dt>
            <dd className="mt-0.5 flex items-center justify-between gap-2">
              <span className="font-mono text-lg font-medium tabular">{fmtTime(r.submittedAt)}</span>
              {r.status !== "ACCEPTED" && <StatusBadge status={r.status} />}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function NotSetUp() {
  return (
    <Card className="p-6 text-center">
      <p className="text-base font-semibold">Check-in isn&apos;t ready yet</p>
      <p className="mx-auto mt-1.5 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
        HR still needs to finish setting up your internship record. This usually happens on your first day.
      </p>
    </Card>
  );
}

// ─── This week ────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function ThisWeek({ records }: { records: AttendanceRecord[] }) {
  const days = useMemo(() => {
    const now = new Date();
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const todayKey = now.toISOString().slice(0, 10);
    return WEEKDAYS.map((label, i) => {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      const rec = records.find((r) => r.checkType === "CHECK_IN" && (r.date ?? r.submittedAt).slice(0, 10) === key);
      return { label, key, rec, future: key > todayKey, isToday: key === todayKey };
    });
  }, [records]);

  return (
    <Card>
      <CardHeader className="pb-1"><CardTitle>This week</CardTitle></CardHeader>
      <ul className="px-[18px] pb-2">
        {days.map((d) => (
          <li key={d.key} className="flex items-center justify-between border-t py-3 first:border-t-0 text-sm">
            <span className={cn("w-12", d.isToday ? "font-semibold" : "text-muted-foreground")}>{d.label}</span>
            <span className="flex-1 font-mono tabular">{d.rec ? fmtTime(d.rec.submittedAt) : d.future ? "" : "—"}</span>
            {d.rec ? <StatusBadge status={d.rec.status} /> : !d.future && !d.isToday ? <span className="text-xs text-muted-foreground">No check-in</span> : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
