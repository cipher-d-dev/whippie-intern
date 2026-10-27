"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin, GraduationCap,
  BookOpen, Hash, Building2, LogOut, Edit2, Save, X, Loader2,
  ChevronRight, CalendarDays, KeyRound, Chrome, Link2Off, Plus,
  Eye, EyeOff, Bell, BellOff, Camera,
} from "lucide-react";
import { useSession, useLogout, useLinkPassword, useUnlinkGoogle, useUnlinkPassword } from "@/features/auth/auth.hooks";
import { useMyInternRecord } from "@/features/dashboard/dashboard.hooks";
import { useInternSummary } from "@/features/dashboard/dashboard.hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUpdateMyProfile, type UpdateProfilePayload } from "@/features/profile/profile.api";
import { apiGetAvatarUploadInfo, apiUpdateAvatar } from "@/features/profile/profile.api";
import { uploadToAppwrite } from "@/features/documents/documents.api";
import { SESSION_QUERY_KEY } from "@/features/auth/auth.hooks";
import Image from "next/image";
import { INTERN_ME_KEY } from "@/features/dashboard/dashboard.hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { subscribeToPush, unsubscribeFromPush, getPushPermissionState } from "@/lib/push";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be under 5MB.');
      return;
    }
    setUploadingAvatar(true);
    try {
      const info = await apiGetAvatarUploadInfo();
      await uploadToAppwrite(info, file);
      const avatarUrl = `${info.endpoint}/storage/buckets/${info.bucketId}/files/${info.fileId}/view?project=${info.projectId}`;
      await apiUpdateAvatar(avatarUrl);
      void qc.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      toast.success('Profile picture updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

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

      {/* Sign-in methods */}
      <SignInMethodsCard authMethod={user?.authMethod ?? "PASSWORD"} className="animate-fade-up delay-200" />

      {/* Push notifications toggle */}
      <PushNotificationsCard className="animate-fade-up delay-225" />

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

function SignInMethodsCard({ authMethod, className }: { authMethod: string; className?: string }) {
  const linkPassword   = useLinkPassword();
  const unlinkGoogle   = useUnlinkGoogle();
  const unlinkPassword = useUnlinkPassword();

  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newPw, setNewPw]                     = useState("");
  const [showNewPw, setShowNewPw]             = useState(false);

  const hasPassword = authMethod === "PASSWORD" || authMethod === "BOTH";
  const hasGoogle   = authMethod === "GOOGLE"   || authMethod === "BOTH";
  const canUnlink   = authMethod === "BOTH"; // can only remove one if both are present

  return (
    <InfoCard title="Sign-in methods" className={className}>
      {/* Password row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <p className="text-sm font-medium text-foreground">Password</p>
        </div>
        {hasPassword ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-500">Active</span>
            {canUnlink && (
              <button
                onClick={() => unlinkPassword.mutate()}
                disabled={unlinkPassword.isPending}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-colors"
                aria-label="Remove password"
              >
                {unlinkPassword.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2Off className="h-3 w-3" />}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAddPassword((v) => !v)}
            className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline underline-offset-4"
          >
            <Plus className="h-3.5 w-3.5" />Add
          </button>
        )}
      </div>

      {/* Inline add-password form */}
      {showAddPassword && (
        <div className="space-y-2 pt-1 animate-fade-up">
          <div className="relative">
            <input
              type={showNewPw ? "text" : "password"}
              placeholder="New password (min 8 chars + number)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 pr-10 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowNewPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showNewPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 h-8 text-xs"
              disabled={linkPassword.isPending || newPw.length < 8}
              onClick={() => linkPassword.mutate(newPw, { onSuccess: () => { setShowAddPassword(false); setNewPw(""); } })}
            >
              {linkPassword.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Set password"}
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={() => setShowAddPassword(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Google row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            <Chrome className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <p className="text-sm font-medium text-foreground">Google</p>
        </div>
        {hasGoogle ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-500">Active</span>
            {canUnlink && (
              <button
                onClick={() => unlinkGoogle.mutate()}
                disabled={unlinkGoogle.isPending}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-colors"
                aria-label="Remove Google"
              >
                {unlinkGoogle.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2Off className="h-3 w-3" />}
              </button>
            )}
          </div>
        ) : (
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/v1/auth/google`}
            className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline underline-offset-4"
          >
            <Plus className="h-3.5 w-3.5" />Add
          </a>
        )}
      </div>
    </InfoCard>
  );
}

function PushNotificationsCard({ className }: { className?: string }) {
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt" | "unsupported" | "loading">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushPermissionState().then(setPermission);
  }, []);

  const handleEnable = async () => {
    setBusy(true);
    const result = await subscribeToPush();
    setBusy(false);
    if (result === "subscribed") {
      setPermission("granted");
      toast.success("Push notifications enabled");
    } else if (result === "denied") {
      setPermission("denied");
      toast.error("Notifications blocked — enable them in your browser settings");
    } else if (result === "already_subscribed") {
      setPermission("granted");
      toast.info("Already subscribed");
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    await unsubscribeFromPush();
    setBusy(false);
    setPermission("prompt");
    toast.success("Push notifications disabled");
  };

  if (permission === "unsupported") return null;

  return (
    <InfoCard title="Notifications" className={className}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            {permission === "granted"
              ? <Bell    className="h-3.5 w-3.5 text-violet-500" />
              : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
            }
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Push notifications</p>
            <p className="text-[11px] text-muted-foreground">
              {permission === "granted"  && "You'll receive alerts in the background"}
              {permission === "denied"   && "Blocked — change in browser settings"}
              {permission === "prompt"   && "Get notified even when the app is closed"}
              {permission === "loading"  && "Checking…"}
            </p>
          </div>
        </div>

        {permission === "loading" && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {permission === "granted" && (
          <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={handleDisable} disabled={busy}>
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Disable"}
          </Button>
        )}
        {(permission === "prompt") && (
          <Button size="sm" className="h-7 text-xs shrink-0" onClick={handleEnable} disabled={busy}>
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Enable"}
          </Button>
        )}
        {permission === "denied" && (
          <span className="text-[11px] font-semibold text-rose-500 shrink-0">Blocked</span>
        )}
      </div>
    </InfoCard>
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
