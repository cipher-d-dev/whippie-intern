"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, ChevronRight, FileText, MapPin, PenLine, ScanFace } from "lucide-react";
import { needsFacePhoto, useMyFace } from "@/features/face/face";
import { useSession } from "@/features/auth/auth.hooks";
import {
  useMyInternRecord,
  useTodayAttendance,
  useMyTasks,
  useMyNotifications,
  useMyReports,
} from "@/features/dashboard/dashboard.hooks";
import type { AttendanceRecord, ReportItem, TaskItem } from "@/features/dashboard/dashboard.api";
import { workWeek } from "@/features/reports/sections";
import { fmtDate, fmtDay, fmtDuration, fmtTime, fmtWhen, greeting, programmeProgress } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { headerIconButton } from "@/components/layout/ScreenHeader";
import { cn } from "@/lib/utils";

const OPEN: TaskItem["status"][] = ["CHANGES_REQUESTED", "IN_PROGRESS", "TODO"];

export function HomeDashboard() {
  const { data: user } = useSession();
  const { data: intern, isLoading: internLoading } = useMyInternRecord();
  const { data: today, isLoading: attLoading } = useTodayAttendance();
  const { data: tasks, isLoading: tasksLoading } = useMyTasks();
  const { data: notifications } = useMyNotifications();
  const { data: reports } = useMyReports();
  const { data: face } = useMyFace();

  const records = Array.isArray(today) ? today : [];
  const checkIn = records.find((a) => a.checkType === "CHECK_IN") ?? null;
  const checkOut = records.find((a) => a.checkType === "CHECK_OUT") ?? null;

  const openTasks = (tasks?.data ?? [])
    .filter((t) => OPEN.includes(t.status))
    .sort((a, b) => OPEN.indexOf(a.status) - OPEN.indexOf(b.status) || dueTime(a) - dueTime(b));
  const unread = notifications?.data.filter((n) => !n.read) ?? [];
  const progress = programmeProgress(intern?.startDate, intern?.endDate);

  return (
    <div className="flex flex-col gap-3.5 px-5 pb-6 pt-5 animate-fade-in">
      <header className="flex items-center gap-3 pb-1">
        <Link href="/profile" aria-label="Your profile">
          <PersonAvatar firstName={user?.firstName} lastName={user?.lastName} src={user?.avatarUrl} size="lg" className="h-11 w-11" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted-foreground">{fmtDay()}</p>
          <h1 className="truncate text-xl font-semibold tracking-[-0.02em]">
            {greeting()}, {user?.firstName ?? "there"}
          </h1>
        </div>
        <Link
          href="/notifications"
          aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
          className={cn(headerIconButton, "relative")}
        >
          <Bell className="h-5 w-5" />
          {unread.length > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
          )}
        </Link>
      </header>

      {needsFacePhoto(face) && (
        <Link href="/face" className="press flex items-center gap-3.5 rounded-2xl border border-warning/40 bg-warning-soft px-[18px] py-4">
          <ScanFace className="h-6 w-6 shrink-0 text-warning-foreground" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{face?.status === "REJECTED" ? "HR asked for a new face photo" : "Add your face photo"}</span>
            <span className="block text-[13px] text-muted-foreground">You&apos;ll need it to check in.</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      )}

      {attLoading ? <Skeleton className="h-[136px] rounded-2xl" /> : <TodayCard checkIn={checkIn} checkOut={checkOut} />}

      {internLoading ? (
        <Skeleton className="h-[96px] rounded-2xl" />
      ) : (
        progress && (
          <Card className="px-[18px] py-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold">Your programme</h2>
              <p className="text-[13px] text-muted-foreground">
                <span className="font-mono text-foreground">Week {progress.currentWeek}</span> of {progress.totalWeeks}
              </p>
            </div>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Programme progress"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="mt-2.5 flex justify-between text-xs text-muted-foreground">
              <span>Started {fmtDate(intern?.startDate)}</span>
              <span>
                Ends {fmtDate(intern?.endDate)} · <span className="text-foreground">{progress.daysLeft}</span> days left
              </span>
            </div>
          </Card>
        )
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <Link href="/tasks" className="text-[13px] font-medium text-primary hover:underline">See all</Link>
        </CardHeader>
        {tasksLoading ? (
          <div className="space-y-2 px-[18px] pb-4"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
        ) : openTasks.length === 0 ? (
          <p className="px-[18px] pb-5 text-sm text-muted-foreground">Nothing open right now. New tasks from your supervisor show up here.</p>
        ) : (
          <>
            <p className="px-[18px] pb-3 text-[13px] text-muted-foreground">
              <span className="font-mono text-[28px] font-medium leading-none tracking-[-0.02em] text-foreground">{openTasks.length}</span>
              <span className="ml-2">open</span>
            </p>
            <ul className="space-y-2 px-3 pb-3">
              {openTasks.slice(0, 3).map((t) => <TaskRow key={t.id} task={t} />)}
            </ul>
          </>
        )}
      </Card>

      <ReportCard reports={reports?.data ?? []} week={progress?.currentWeek} />

      {(notifications?.data.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent</CardTitle>
            <Link href="/notifications" className="text-[13px] font-medium text-primary hover:underline">All</Link>
          </CardHeader>
          <ul className="px-[18px] pb-2">
            {notifications!.data.slice(0, 3).map((n) => (
              <li key={n.id} className="flex items-start gap-3 border-t py-3">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                  <p className="line-clamp-1 text-[13px] text-muted-foreground">{n.body}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{fmtWhen(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function dueTime(t: TaskItem) {
  return t.deadline ? new Date(t.deadline).getTime() : Infinity;
}

// ─── Today ────────────────────────────────────────────────────────────────────

function TodayCard({ checkIn, checkOut }: { checkIn: AttendanceRecord | null; checkOut: AttendanceRecord | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!checkIn) {
    return (
      <div className="flex items-center gap-4 rounded-2xl bg-card px-[18px] py-5 dark:border">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MapPin className="h-[22px] w-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">You haven&apos;t checked in</p>
          <p className="text-[13px] text-muted-foreground">Check in when you get to the office.</p>
        </div>
        <Button asChild><Link href="/attendance">Check in</Link></Button>
      </div>
    );
  }

  const end = checkOut ? new Date(checkOut.submittedAt).getTime() : now;
  const flagged = checkIn.status !== "ACCEPTED" && checkIn.status !== "CORRECTED";

  return (
    <div className="flex items-stretch justify-between gap-3 rounded-2xl bg-primary p-[18px] text-primary-foreground">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[13px] opacity-90">
          <span className={cn("h-2 w-2 rounded-full", checkOut ? "bg-primary-foreground/60" : flagged ? "bg-warning" : "bg-[#4ADE80]")} aria-hidden="true" />
          {checkOut ? "Checked out" : flagged ? "Checked in · HR will review" : "Checked in"}
        </p>
        <p className="mt-2 font-mono text-[44px] font-medium leading-none tracking-[-0.04em] tabular">
          {fmtTime(checkOut ? checkOut.submittedAt : checkIn.submittedAt)}
        </p>
        <p className="mt-2 text-[13px] opacity-90">
          {checkOut ? `${fmtDuration(end - new Date(checkIn.submittedAt).getTime())} on site today` : `On site for ${fmtDuration(end - new Date(checkIn.submittedAt).getTime())}`}
        </p>
      </div>
      {!checkOut && (
        <div className="flex items-end">
          <Link
            href="/attendance"
            className="press inline-flex h-11 items-center rounded-xl bg-card px-4 text-[15px] font-medium text-primary hover:bg-card/90"
          >
            Check out
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: TaskItem }) {
  const changes = task.status === "CHANGES_REQUESTED";
  const overdue = task.deadline && new Date(task.deadline) < new Date();
  return (
    <li>
      <Link
        href={`/tasks/${task.id}`}
        className={cn(
          "press flex items-center gap-3 rounded-xl border px-3.5 py-3 hover:bg-muted/60",
          changes && "border-warning/40 bg-warning-soft/60 hover:bg-warning-soft",
        )}
      >
        <span className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          changes ? "bg-warning-soft text-warning-foreground" : "bg-muted text-muted-foreground",
        )}>
          {changes ? <PenLine className="h-[18px] w-[18px]" /> : <FileText className="h-[18px] w-[18px]" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm font-medium">{task.title}</span>
          <span className={cn("block text-xs", changes ? "text-warning-foreground" : overdue ? "text-danger-foreground" : "text-muted-foreground")}>
            {changes ? "Changes requested" : task.deadline ? `${overdue ? "Was due" : "Due"} ${fmtDate(task.deadline)}` : task.status === "TODO" ? "Not started" : "In progress"}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}

function ReportCard({ reports, week }: { reports: ReportItem[]; week?: number }) {
  const { start, end } = workWeek();
  const thisWeek = reports.find(
    (r) => r.type === "WEEKLY" && r.periodStart && r.periodStart.slice(0, 10) >= start && r.periodStart.slice(0, 10) <= end,
  );
  const title = week ? `Week ${week} report` : "This week's report";

  let sub = "Due Friday · not started";
  let action = <Button variant="ink" size="sm" className="h-10 px-4" asChild><Link href="/reports/new?type=WEEKLY">Write</Link></Button>;
  if (thisWeek?.status === "DRAFT") {
    sub = `Draft saved ${fmtWhen(thisWeek.updatedAt)}`;
    action = <Button variant="ink" size="sm" className="h-10 px-4" asChild><Link href={`/reports/${thisWeek.id}`}>Continue</Link></Button>;
  } else if (thisWeek) {
    sub = thisWeek.status === "REVIEWED" ? "Reviewed by your supervisor" : `Sent ${fmtWhen(thisWeek.updatedAt)}`;
    action = <StatusBadge status={thisWeek.status} />;
  }

  return (
    <Card className="flex items-center gap-3.5 px-[18px] py-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <FileText className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-[13px] text-muted-foreground">{sub}</p>
      </div>
      {action}
    </Card>
  );
}
