"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera, ChevronRight, Chrome, Eye, EyeOff, KeyRound, Loader2, LogOut, Milestone, NotebookPen, Star,
} from "lucide-react";
import { useSession, useLogout, useLinkPassword, useUnlinkGoogle, useUnlinkPassword } from "@/features/auth/auth.hooks";
import { useMyInternRecord } from "@/features/dashboard/dashboard.hooks";
import { useInternSummary } from "@/features/dashboard/dashboard.hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUpdateMyProfile, type UpdateProfilePayload } from "@/features/profile/profile.api";
import { apiGetAvatarUploadInfo, apiUpdateAvatar } from "@/features/profile/profile.api";
import { uploadToAppwrite } from "@/features/documents/documents.api";
import { SESSION_QUERY_KEY } from "@/features/auth/auth.hooks";
import { INTERN_ME_KEY } from "@/features/dashboard/dashboard.hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { fmtDate } from "@/lib/format";
import { subscribeToPush, unsubscribeFromPush, getPushPermissionState } from "@/lib/push";

export function ProfileScreen() {
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
  const dept = intern?.department;
  const roleLine = [
    intern?.internshipType === "NYSC_IT" ? "Corps member" : "Intern",
    dept ? [dept.name, dept.subsidiary].filter(Boolean).join(", ") : null,
  ].filter(Boolean).join(" · ");
  const avg = summary?.evaluations.averageScores?.overall;

  return (
    <div className="flex flex-col gap-3.5 px-5 pb-6 pt-5 animate-fade-in">
      <header className="flex items-center gap-3.5">
        <label className="relative shrink-0 cursor-pointer" aria-label="Change profile photo">
          <PersonAvatar firstName={user?.firstName} lastName={user?.lastName} src={user?.avatarUrl} size="xl" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-card text-foreground shadow-sm">
            {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarFile} disabled={uploadingAvatar} />
        </label>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[22px] font-semibold tracking-[-0.02em]">{fullName}</h1>
          <p className="truncate text-[13px] text-muted-foreground">{roleLine}</p>
        </div>
        <ThemeToggle />
      </header>

      {summary && (
        <dl className="grid grid-cols-3 gap-2.5">
          <MiniStat label="Days in" value={summary.attendance.accepted + summary.attendance.corrected} />
          <MiniStat label="Tasks done" value={summary.tasks.completed} />
          <MiniStat label="Avg score" value={avg ? avg.toFixed(1) : "—"} />
        </dl>
      )}

      <Card className="divide-y overflow-hidden">
        {[
          { label: "Timeline & documents", sub: summary ? `${summary.documents.verified} of ${summary.documents.total} documents verified` : "Your milestones and paperwork", href: "/timeline", icon: Milestone },
          { label: "Evaluations", sub: summary?.evaluations.count ? `${summary.evaluations.count} from your supervisor` : "Feedback from your supervisor", href: "/evaluations", icon: Star },
          { label: "Notes & to-dos", sub: "Private to this phone", href: "/notes", icon: NotebookPen },
        ].map(({ label, sub, href, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 px-[18px] py-3.5 hover:bg-muted/50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="h-[18px] w-[18px]" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">{label}</span>
              <span className="block truncate text-[13px] text-muted-foreground">{sub}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </Card>

      {intern && (
        <InfoCard title="Placement">
          <InfoRow label="Department" value={dept ? [dept.name, dept.subsidiary].filter(Boolean).join(", ") : "Not assigned yet"} />
          <InfoRow label="Supervisor" value={intern.supervisor ? `${intern.supervisor.firstName} ${intern.supervisor.lastName}` : "Not assigned yet"} />
          <InfoRow label="Dates" value={intern.startDate ? `${fmtDate(intern.startDate, true)} – ${fmtDate(intern.endDate, true)}` : "Not set yet"} />
          <InfoRow label="Status" value={<StatusBadge status={intern.status} />} />
        </InfoCard>
      )}

      <InfoCard
        title="Personal details"
        action={
          editing ? (
            <button onClick={() => setEditing(false)} className="text-[13px] font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          ) : (
            <button onClick={startEditing} className="text-[13px] font-medium text-primary hover:underline">Edit</button>
          )
        }
      >
        {editing ? (
          <div className="space-y-3 py-2">
            {([
              ["phone", "Phone", "tel"],
              ["address", "Address", "text"],
              ["institution", "Institution", "text"],
              ["course", "Course", "text"],
              ["level", "Level", "text"],
            ] as const).map(([field, label, type]) => (
              <div key={field}>
                <label htmlFor={`f-${field}`} className="text-[13px] font-medium">{label}</label>
                <input
                  id={`f-${field}`}
                  type={type}
                  value={form[field] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-[15px]"
                />
              </div>
            ))}
            <Button className="w-full" onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="animate-spin" />} Save changes
            </Button>
          </div>
        ) : (
          <>
            <InfoRow label="Email" value={user?.email ?? "—"} />
            <InfoRow label="Phone" value={intern?.phone || "Not added"} muted={!intern?.phone} />
            <InfoRow label="Address" value={intern?.address || "Not added"} muted={!intern?.address} />
            <InfoRow label="Institution" value={intern?.institution || "Not added"} muted={!intern?.institution} />
            <InfoRow label="Course" value={intern?.course || "Not added"} muted={!intern?.course} />
            <InfoRow label="Level" value={intern?.level || "Not added"} muted={!intern?.level} />
          </>
        )}
      </InfoCard>

      <SignInMethodsCard authMethod={user?.authMethod ?? "PASSWORD"} />
      <PushNotificationsCard />

      <Button variant="outline" size="lg" className="w-full text-danger-foreground hover:bg-danger-soft" onClick={() => logout.mutate()} disabled={logout.isPending}>
        {logout.isPending ? <Loader2 className="animate-spin" /> : <LogOut />} Sign out
      </Button>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <div className="px-[18px] pb-2">{children}</div>
    </Card>
  );
}

function InfoRow({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t py-3 first:border-t-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 truncate text-right text-sm", muted ? "text-muted-foreground" : "font-medium")}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-card px-3.5 py-3 dark:border">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-[22px] font-medium tabular">{value}</dd>
    </div>
  );
}

function SignInMethodsCard({ authMethod }: { authMethod: string }) {
  const linkPassword   = useLinkPassword();
  const unlinkGoogle   = useUnlinkGoogle();
  const unlinkPassword = useUnlinkPassword();

  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newPw, setNewPw]                     = useState("");
  const [showNewPw, setShowNewPw]             = useState(false);

  const hasPassword = authMethod === "PASSWORD" || authMethod === "BOTH";
  const hasGoogle   = authMethod === "GOOGLE"   || authMethod === "BOTH";
  const canUnlink   = authMethod === "BOTH"; // you can only remove one when you have both

  const remove = (label: string, pending: boolean, onClick: () => void) => (
    <button onClick={onClick} disabled={pending} className="text-[13px] font-medium text-muted-foreground hover:text-danger-foreground">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Remove`}
      <span className="sr-only"> {label}</span>
    </button>
  );

  return (
    <InfoCard title="Sign-in">
      <div className="flex items-center justify-between gap-3 py-3">
        <span className="flex items-center gap-3 text-sm"><KeyRound className="h-[18px] w-[18px] text-muted-foreground" /> Password</span>
        {hasPassword ? (
          <span className="flex items-center gap-3">
            <Badge variant="success">On</Badge>
            {canUnlink && remove("password", unlinkPassword.isPending, () => unlinkPassword.mutate())}
          </span>
        ) : (
          <button onClick={() => setShowAddPassword((v) => !v)} className="text-[13px] font-medium text-primary hover:underline">
            Add password
          </button>
        )}
      </div>

      {showAddPassword && (
        <div className="space-y-2.5 pb-3">
          <label htmlFor="new-pw" className="text-[13px] font-medium">New password</label>
          <div className="relative">
            <input
              id="new-pw"
              type={showNewPw ? "text" : "password"}
              autoComplete="new-password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-card px-3.5 pr-11 text-[15px]"
            />
            <button
              type="button"
              onClick={() => setShowNewPw((v) => !v)}
              aria-label={showNewPw ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted-foreground"
            >
              {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">At least 8 characters, including a number.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddPassword(false)}>Cancel</Button>
            <Button
              className="flex-1"
              disabled={linkPassword.isPending || newPw.length < 8}
              onClick={() => linkPassword.mutate(newPw, { onSuccess: () => { setShowAddPassword(false); setNewPw(""); } })}
            >
              {linkPassword.isPending && <Loader2 className="animate-spin" />} Set password
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t py-3">
        <span className="flex items-center gap-3 text-sm"><Chrome className="h-[18px] w-[18px] text-muted-foreground" /> Google</span>
        {hasGoogle ? (
          <span className="flex items-center gap-3">
            <Badge variant="success">On</Badge>
            {canUnlink && remove("Google", unlinkGoogle.isPending, () => unlinkGoogle.mutate())}
          </span>
        ) : (
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/v1/auth/google`}
            className="text-[13px] font-medium text-primary hover:underline"
          >
            Connect Google
          </a>
        )}
      </div>
    </InfoCard>
  );
}

function PushNotificationsCard() {
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt" | "unsupported" | "loading">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushPermissionState().then(setPermission);
  }, []);

  const handleEnable = async () => {
    setBusy(true);
    const result = await subscribeToPush();
    setBusy(false);
    if (result === "subscribed" || result === "already_subscribed") {
      setPermission("granted");
      toast.success("Notifications are on");
    } else if (result === "denied") {
      setPermission("denied");
      toast.error("Notifications are blocked. Allow them in your browser settings.");
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    await unsubscribeFromPush();
    setBusy(false);
    setPermission("prompt");
    toast.success("Notifications are off");
  };

  if (permission === "unsupported") return null;

  return (
    <InfoCard title="Notifications">
      <div className="flex items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          <p className="text-sm">Push notifications</p>
          <p className="text-[13px] text-muted-foreground">
            {permission === "granted" && "On. You'll hear about feedback even when the app is closed."}
            {permission === "denied" && "Blocked. Change this in your browser settings."}
            {permission === "prompt" && "Hear about new tasks and feedback right away."}
            {permission === "loading" && "Checking…"}
          </p>
        </div>
        {permission === "granted" && (
          <Button size="sm" variant="outline" className="shrink-0" onClick={handleDisable} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : "Turn off"}
          </Button>
        )}
        {permission === "prompt" && (
          <Button size="sm" className="shrink-0" onClick={handleEnable} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : "Turn on"}
          </Button>
        )}
      </div>
    </InfoCard>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-3.5 px-5 pt-5">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-52" /></div>
      </div>
      <Skeleton className="h-[72px] rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}
