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
import { TasksSummaryCard } from "./cards/TasksSummaryCard";
import { NotificationsFeedCard } from "./cards/NotificationsFeedCard";
import { ProgressCard } from "./cards/ProgressCard";
import { ReportStatusCard } from "./cards/ReportStatusCard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function HomeDashboard() {
  const router = useRouter();
  const { data: user, isLoading: sessionLoading } = useSession();

  // Redirect non-active accounts
  useEffect(() => {
    if (!user) return;
    if (user.accountStatus === "PENDING_HR_VERIFICATION") router.replace("/verification-pending");
    if (user.accountStatus === "REJECTED") router.replace("/account-rejected");
  }, [user, router]);

  const { data: intern, isLoading: internLoading } = useMyInternRecord();
  const { data: summary } = useInternSummary(intern?.id);
  const { data: todayAttendance, isLoading: attendanceLoading } = useTodayAttendance();
  const { data: activeTasks, isLoading: tasksLoading } = useMyTasks();
  const { data: notifications } = useMyNotifications(false);
  const { data: reports } = useMyReports();

  const isLoading = sessionLoading || internLoading;

  if (isLoading) return <DashboardSkeleton />;

  const firstName = user?.firstName ?? "there";
  const greeting = getGreeting();
  const checkIn = todayAttendance?.find((a) => a.checkType === "CHECK_IN");
  const checkOut = todayAttendance?.find((a) => a.checkType === "CHECK_OUT");
  const pendingTasks = activeTasks?.data.filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS" || t.status === "CHANGES_REQUESTED"
  ) ?? [];
  const unreadCount = notifications?.data.filter((n) => !n.read).length ?? 0;
  const draftReports = reports?.data.filter((r) => r.status === "DRAFT") ?? [];
  const hasFeedback = activeTasks?.data.some((t) => t.feedback && t.status === "CHANGES_REQUESTED") ?? false;

  return (
    <div className="px-4 pb-6 pt-5 space-y-5">

      {/* ── Greeting header ─────────────────────────────────────── */}
      <div className="animate-fade-up">
        <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {firstName} 👋
        </h1>
        {intern && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {intern.department
              ? `${(intern.department as any).name} · ${intern.internshipType === "NYSC_IT" ? "NYSC IT" : "Intern"}`
              : intern.internshipType === "NYSC_IT" ? "NYSC IT" : "Intern"}
          </p>
        )}
      </div>

      {/* ── Urgent banner: changes requested ────────────────────── */}
      {hasFeedback && (
        <div className="animate-fade-up delay-50 rounded-2xl border border-amber-200/60 bg-amber-50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-900/20">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            ⚠️ A task needs your attention — changes requested by supervisor.
          </p>
        </div>
      )}

      {/* ── Attendance ───────────────────────────────────────────── */}
      <AttendanceStatusCard
        checkIn={checkIn ?? null}
        checkOut={checkOut ?? null}
        isLoading={attendanceLoading}
        className="animate-fade-up delay-100"
      />

      {/* ── Two-column stat row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatPill
          label="Tasks active"
          value={pendingTasks.length}
          color="violet"
          className="animate-fade-up delay-150"
          onClick={() => router.push("/tasks")}
        />
        <StatPill
          label="Unread alerts"
          value={unreadCount}
          color={unreadCount > 0 ? "amber" : "emerald"}
          className="animate-fade-up delay-200"
          onClick={() => router.push("/notifications")}
        />
      </div>

      {/* ── Tasks summary ────────────────────────────────────────── */}
      <TasksSummaryCard
        tasks={pendingTasks}
        summary={summary?.tasks}
        isLoading={tasksLoading}
        className="animate-fade-up delay-200"
      />

      {/* ── Progress card ────────────────────────────────────────── */}
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

      {/* ── Notifications feed ───────────────────────────────────── */}
      <NotificationsFeedCard
        notifications={notifications?.data.slice(0, 5) ?? []}
        className="animate-fade-up delay-300"
      />

    </div>
  );
}

// ─── Greeting helper ──────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

// ─── Inline stat pill ─────────────────────────────────────────────────────────

interface StatPillProps {
  label: string;
  value: number;
  color: "violet" | "emerald" | "amber" | "rose" | "blue";
  className?: string;
  onClick?: () => void;
}

const colorMap: Record<StatPillProps["color"], string> = {
  violet:  "bg-card-violet",
  emerald: "bg-card-emerald",
  amber:   "bg-card-amber",
  rose:    "bg-card-rose",
  blue:    "bg-card-blue",
};

function StatPill({ label, value, color, className, onClick }: StatPillProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 ${colorMap[color]} hover-lift hover-press ${className ?? ""}`}
    >
      <p className="text-3xl font-extrabold animate-count-in">{value}</p>
      <p className="mt-1 text-xs font-medium opacity-80">{label}</p>
    </button>
  );
}
