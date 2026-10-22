"use client";

import { useSession } from "@/features/auth/auth.hooks";
import {
  useMyInternRecord,
  useInternSummary,
  useTodayAttendance,
  useMyTasks,
  useMyNotifications,
  useMyReports,
} from "@/features/dashboard/dashboard.hooks";
import { AttendanceStatusCard } from "./cards/AttendanceStatusCard";
import { TasksSummaryCard }     from "./cards/TasksSummaryCard";
import { NotificationsFeedCard } from "./cards/NotificationsFeedCard";
import { ProgressCard }         from "./cards/ProgressCard";
import { ReportStatusCard }     from "./cards/ReportStatusCard";
import { DashboardSkeleton }    from "./DashboardSkeleton";
import { ThemeToggle }          from "@/components/shared/ThemeToggle";
import { WhippieLogo }          from "@/components/shared/WhippieLogo";
import { useRouter }            from "next/navigation";

export function HomeDashboard() {
  const router = useRouter();

  const { data: user }                                  = useSession();
  const { data: intern, isLoading: internLoading }      = useMyInternRecord();
  const { data: summary }                               = useInternSummary(intern?.id);
  const { data: todayAttendance, isLoading: attLoading } = useTodayAttendance();
  const { data: activeTasks,     isLoading: tasksLoading } = useMyTasks();
  const { data: notifications }                         = useMyNotifications(false);
  const { data: reports }                               = useMyReports();

  if (internLoading) return <DashboardSkeleton />;

  const firstName   = user?.firstName ?? "there";
  const greeting    = getGreeting();
  const checkIn     = (Array.isArray(todayAttendance) ? todayAttendance : [])?.find((a) => a.checkType === "CHECK_IN")  ?? null;
  const checkOut    = (Array.isArray(todayAttendance) ? todayAttendance : [])?.find((a) => a.checkType === "CHECK_OUT") ?? null;
  const pendingTasks = activeTasks?.data.filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS" || t.status === "CHANGES_REQUESTED"
  ) ?? [];
  const unreadCount  = notifications?.data.filter((n) => !n.read).length ?? 0;
  const draftReports = reports?.data.filter((r) => r.status === "DRAFT") ?? [];
  const hasFeedback  = activeTasks?.data.some(
    (t) => t.feedback && t.status === "CHANGES_REQUESTED"
  ) ?? false;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-5">

      {/* ── Greeting & Top Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card border border-border/80 shadow-xs">
            <WhippieLogo size={32} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{greeting}</p>
            <h1 className="text-2xl font-black tracking-tight text-foreground leading-tight">
              {firstName}
            </h1>
            {intern && (
              <p className="text-[11px] font-medium text-muted-foreground">
                {(intern.department as any)?.name
                  ? `${(intern.department as any).name} · `
                  : ""}
                {intern.internshipType === "NYSC_IT" ? "NYSC IT" : "Intern"}
              </p>
            )}
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* ── Urgent: changes requested ───────────────────────────── */}
      {hasFeedback && (
        <div className="animate-scale-in flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 text-amber-900 dark:text-amber-200">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-200/50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
            <span className="text-xs font-bold">!</span>
          </div>
          <p className="text-xs font-semibold leading-normal">
            A task needs your attention — your supervisor requested changes.
          </p>
        </div>
      )}

      {/* ── Attendance card ──────────────────────────────────────── */}
      <AttendanceStatusCard
        checkIn={checkIn}
        checkOut={checkOut}
        isLoading={attLoading}
        className="animate-fade-up delay-100"
      />

      {/* ── Stat pills ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatPill
          label="Active tasks"
          value={pendingTasks.length}
          gradient="from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500"
          onClick={() => router.push("/tasks")}
        />
        <StatPill
          label="Unread alerts"
          value={unreadCount}
          gradient="from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500"
          onClick={() => router.push("/notifications")}
        />
      </div>

      {/* ── Summary & tasks overview ─────────────────────────────── */}
      <TasksSummaryCard
        tasks={activeTasks?.data ?? []}
        isLoading={tasksLoading}
        className="animate-fade-up delay-200"
      />

      {/* ── Progress ─────────────────────────────────────────────── */}
      {summary && intern && (
        <ProgressCard
          intern={intern}
          summary={summary}
          className="animate-fade-up delay-250"
        />
      )}

      {/* ── Reports ──────────────────────────────────────────────── */}
      {draftReports.length > 0 && (
        <ReportStatusCard
          drafts={draftReports}
          className="animate-fade-up delay-300"
        />
      )}

      {/* ── Notifications ────────────────────────────────────────── */}
      <NotificationsFeedCard
        notifications={notifications?.data.slice(0, 5) ?? []}
        className="animate-fade-up delay-300"
      />

    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

function StatPill({
  label, value, gradient, className, onClick,
}: {
  label: string;
  value: number;
  gradient: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl bg-gradient-to-br ${gradient} p-4 shadow-sm hover-lift hover-press text-white border border-white/10 ${className ?? ""}`}
    >
      <p className="text-3xl font-black animate-count-in">{value}</p>
      <p className="mt-1 text-xs font-semibold opacity-90">{label}</p>
    </button>
  );
}
