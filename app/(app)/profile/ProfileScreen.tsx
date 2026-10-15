"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin, GraduationCap,
  BookOpen, Hash, Building2, LogOut, Edit2, Save, X, Loader2,
  ChevronRight, CalendarDays,
} from "lucide-react";
import { useSession, useLogout } from "@/features/auth/auth.hooks";
import { useMyInternRecord } from "@/features/dashboard/dashboard.hooks";
import { useInternSummary } from "@/features/dashboard/dashboard.hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUpdateMyProfile, type UpdateProfilePayload } from "@/features/profile/profile.api";
import { INTERN_ME_KEY } from "@/features/dashboard/dashboard.hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProfileScreen() {
  const router  = useRouter();
  const logout  = useLogout();
  const { data: user,   isLoading: userLoading  } = useSession();
  const { data: intern, isLoading: internLoading } = useMyInternRecord();
  const { data: summary } = useInternSummary(intern?.id);

  const qc = useQueryClient();
  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => apiUpdateMyProfile(intern!.id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(INTERN_ME_KEY, updated);
      toast.success("Profile updated");
      setEditing(false);
    },
    onError: () => toast.error("Could not update profile"),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfilePayload>({});

  const startEditing = () => {
    setForm({
      phone:       intern?.phone       ?? "",
      address:     intern?.address     ?? "",
      institution: intern?.institution ?? "",
      course:      intern?.course      ?? "",
      level:       intern?.level       ?? "",
    });
    setEditing(true);
  };

  const handleSave = () => {
    const payload: UpdateProfilePayload = {};
    if (form.phone       !== undefined) payload.phone       = form.phone;
    if (form.address     !== undefined) payload.address     = form.address;
    if (form.institution !== undefined) payload.institution = form.institution;
    if (form.course      !== undefined) payload.course      = form.course;
    if (form.level       !== undefined) payload.level       = form.level;
    updateProfile.mutate(payload);
  };

  if (userLoading || internLoading) return <ProfileSkeleton />;

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const internStatus = intern?.status ?? "ONBOARDING";
  const statusVariant = {
    ACTIVE:     "success",
    ONBOARDING: "default",
    SCREENED:   "secondary",
    COMPLETED:  "secondary",
  }[internStatus] as "success" | "default" | "secondary";

  return (
    <div className="px-4 pt-5 pb-8 space-y-5">

      {/* Avatar + name */}
      <div className="flex items-center gap-4 animate-fade-up">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-extrabold shadow-violet-md animate-scale-in">
          {user?.firstName?.[0] ?? "?"}{user?.lastName?.[0] ?? ""}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">{fullName}</h1>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant={statusVariant} className="text-[10px]">
              {internStatus}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {intern?.internshipType === "NYSC_IT" ? "NYSC IT" : "Intern"}
            </Badge>
          </div>
        </div>

        {!editing && (
          <button
            onClick={startEditing}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted hover-press"
          >
            <Edit2 className="h-4 w-4 text-foreground" />
          </button>
        )}
        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted hover-press"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        )}
      </div>

      {/* Quick stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-2 animate-fade-up delay-50">
          <MiniStat label="Check-ins" value={summary.attendance.totalCheckIns} color="emerald" />
          <MiniStat label="Tasks done" value={summary.tasks.completed} color="violet" />
          <MiniStat label="Reports"    value={summary.tasks.total} color="blue" />
        </div>
      )}

      {/* Placement info */}
      {intern && (
        <InfoCard title="Placement" className="animate-fade-up delay-100">
          {intern.department && (
            <InfoRow icon={Building2} label="Department" value={(intern.department as any).name} />
          )}
          {intern.supervisor && (
            <InfoRow
              icon={User}
              label="Supervisor"
              value={`${(intern.supervisor as any).firstName} ${(intern.supervisor as any).lastName}`}
            />
          )}
          {intern.startDate && (
            <InfoRow
              icon={CalendarDays}
              label="Start date"
              value={new Date(intern.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            />
          )}
          {intern.endDate && (
            <InfoRow
              icon={CalendarDays}
              label="End date"
              value={new Date(intern.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            />
          )}
        </InfoCard>
      )}

      {/* Editable personal info */}
      <InfoCard
        title="Personal info"
        className="animate-fade-up delay-150"
        action={editing ? (
          <Button size="sm" className="gap-1.5 h-7 text-xs" onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </Button>
        ) : undefined}
      >
        {editing ? (
          <div className="space-y-3 pt-1">
            {(["phone", "address", "institution", "course", "level"] as const).map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-xs text-muted-foreground capitalize">{field}</label>
                <input
                  type="text"
                  value={form[field] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={`Enter ${field}`}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm hover:border-primary/40 transition-colors"
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <InfoRow icon={Mail}          label="Email"       value={user?.email ?? "—"} />
            <InfoRow icon={Phone}         label="Phone"       value={intern?.phone       ?? "Not set"} />
            <InfoRow icon={MapPin}        label="Address"     value={intern?.address     ?? "Not set"} />
            <InfoRow icon={GraduationCap} label="Institution" value={intern?.institution ?? "Not set"} />
            <InfoRow icon={BookOpen}      label="Course"      value={intern?.course      ?? "Not set"} />
            <InfoRow icon={Hash}          label="Level"       value={intern?.level       ?? "Not set"} />
          </>
        )}
      </InfoCard>

      {/* Quick nav links */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden animate-fade-up delay-200">
        {[
          { label: "Timeline & documents", href: "/timeline" },
          { label: "Notes & to-dos",        href: "/notes" },
        ].map(({ label, href }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="flex w-full items-center justify-between px-4 py-3.5 border-b border-border/40 last:border-0 hover-press"
          >
            <span className="text-sm font-medium text-foreground">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full gap-2 text-rose-500 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20 animate-fade-up delay-250"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        {logout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        Sign out
      </Button>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCard({ title, children, className, action }: {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card shadow-card", className)}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        {action}
      </div>
      <div className="px-4 pb-4 space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet:  "text-violet-600 dark:text-violet-400",
    blue:    "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="rounded-xl bg-muted/60 px-2.5 py-2.5 text-center">
      <p className={cn("text-lg font-extrabold animate-count-in", colorMap[color])}>{value}</p>
      <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="px-4 pt-5 space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
