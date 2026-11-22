"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/shared/StatusScreen";
import { useSession, useLogout } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";

export function VerificationPendingClient() {
  const { data: user, isFetching, refetch } = useSession();
  const logout = useLogout();
  const router = useRouter();

  useEffect(() => {
    if (user?.status === "ACTIVE") router.replace("/home");
    else if (user?.status === "REJECTED") router.replace("/account-rejected");
    else if (user?.status === "UNVERIFIED_EMAIL") router.replace("/verify-email");
  }, [user?.status, router]);

  const steps = [
    { label: "Account created", done: true },
    { label: "Email confirmed", done: true },
    { label: "HR checks you're on the programme", done: false },
  ];

  return (
    <StatusScreen
      tone="warning"
      icon={<Clock />}
      title="Waiting for HR"
      actions={
        <>
          <Button size="lg" variant="outline" className="w-full" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn(isFetching && "animate-spin")} /> Check again
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => logout.mutate()} disabled={logout.isPending}>
            <LogOut /> Sign out
          </Button>
        </>
      }
    >
      <p>
        {user ? `Thanks, ${user.firstName}. ` : ""}HR will confirm you&apos;re on the programme before you can use the app.
        You&apos;ll get an email when that&apos;s done, usually within a working day.
      </p>
      <ol className="rounded-2xl bg-card px-4 py-1.5 dark:border">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 border-t py-3 text-sm first:border-t-0">
            <span className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
              s.done ? "bg-success-soft text-success-foreground" : "bg-warning-soft text-warning-foreground",
            )}>
              {s.done ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            </span>
            <span className={s.done ? "text-muted-foreground" : "font-medium text-foreground"}>{s.label}</span>
          </li>
        ))}
      </ol>
    </StatusScreen>
  );
}
