"use client";

import { Clock, Mail, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, useLogout } from "@/features/auth/auth.hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function VerificationPendingClient() {
  const { data: user, isLoading, refetch } = useSession();
  const logout = useLogout();
  const router = useRouter();

  // If HR approved while waiting, redirect immediately
  useEffect(() => {
    if (user?.status === "ACTIVE") {
      router.replace("/home");
    } else if (user?.status === "REJECTED") {
      router.replace("/account-rejected");
    }
  }, [user?.status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 bg-background">
      {/* Ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      {/* Icon */}
      <div className="mb-6 animate-float">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-900/20 shadow-card border border-amber-200/50 dark:border-amber-700/30">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
      </div>

      <div className="w-full max-w-sm text-center space-y-3 animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Awaiting verification
        </h1>
        {user && (
          <p className="text-base font-medium text-foreground/80">
            Hi {user.firstName},
          </p>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your account has been created and is waiting for HR to verify it. This
          usually happens within one business day.
        </p>
      </div>

      {/* Steps card */}
      <div className="mt-8 w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-card space-y-3 animate-fade-up delay-100">
        {[
          { icon: Mail,         text: "You'll receive an email once HR reviews your account." },
          { icon: Clock,        text: "Unverified accounts expire after 30 days." },
          { icon: RefreshCw,    text: "You can check your status by tapping the button below." },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground leading-snug">{text}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 w-full max-w-sm space-y-3 animate-fade-up delay-200">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Check status
        </Button>

        <Button
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
