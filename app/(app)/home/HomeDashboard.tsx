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
  const checkIn     = todayAttendance?.find((a) => a.checkType === "CHECK_IN")  ?? null;
  const checkOut    = todayAttendance?.find((a) => a.checkType === "CHECK_OUT") ?? null;
  const pendingTasks = activeTasks?.data.filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS" || t.status === "CHANGES_REQUESTED"
  ) ?? [];
  const unreadCount  = notifications?.data.filter((n) => !n.read).length ?? 0;
  const draftReports = reports?.data.filter((r) => r.status === "DRAFT") ?? [];
  const hasFeedback  = activeTasks?.data.some(
    (t) => t.feedback && t.status === "CHANGES_REQUESTED"
  ) ?? false;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-6">

      {/* ── Greeting ────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
        <h1 className="text-[1.75rem] font-black tracking-tight text-foreground leading-tight">
          {firstName} 👋
        </h1>
        {intern && (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {(intern.department as any)?.name
              ? `${(intern.department as any).name} · `
              : ""}
            {intern.internshipType === "NYSC_IT" ? "NYSC IT" : "Intern"}
          </p>
        )}
      </div>

      {/* ── Urgent: changes requested ───────────────────────────── */}
      {hasFeedback && (
        <div className="animate-scale-in rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-900/20 dark:to-amber-800/10 px-4 py-3">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
            ⚠️ A task needs your attention — supervisor requested changes.
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
          gradient="from-violet-500 to-violet-600"
          className="animate-fade-up delay-150"
          onClick={() => router.push("/tasks")}
        />
        <StatPill
          label="Unread alerts"
          value={unreadCount}
          gradient={unreadCount > 0 ? "from-amber-400 to-amber-500" : "from-emerald-400 to-emerald-500"}
          className="animate-fade-up delay-200"
          onClick={() => router.push("/notifications")}
        />
      </div>

      {/* ── Tasks ────────────────────────────────────────────────── */}
      <TasksSummaryCard
        tasks={pendingTasks}
        summary={summary?.tasks}
        isLoading={tasksLoading}
        className="animate-fade-up delay-200"
      />

      {/* ── Progress ─────────────────────────────────────────────── */}
      {intern && summary && (
        <ProgressCard
          intern={intern}
          summary={summary}
          className="animate-fade-up delay-250"
        />
      )}

      {/* ── Report reminder ──────────────────────────────────────── */}
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
      className={`w-full text-left rounded-2xl bg-gradient-to-br ${gradient} p-4 shadow-violet-sm hover-lift hover-press text-white ${className ?? ""}`}
    >
      <p className="text-3xl font-black animate-count-in">{value}</p>
      <p className="mt-1 text-xs font-semibold opacity-90">{label}</p>
    </button>
  );
}
