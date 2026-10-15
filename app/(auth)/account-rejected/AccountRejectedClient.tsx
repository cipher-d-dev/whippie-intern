"use client";

import { XCircle, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/auth.hooks";

export function AccountRejectedClient() {
  const logout = useLogout();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-400/10 blur-3xl" />
      </div>

      {/* Icon */}
      <div className="mb-6 animate-scale-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 dark:bg-rose-900/20 shadow-card border border-rose-200/50 dark:border-rose-700/30">
          <XCircle className="h-10 w-10 text-rose-500" />
        </div>
      </div>

      <div className="w-full max-w-sm text-center space-y-3 animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Account not approved
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your Whippe account was not approved by HR. If you believe this is a
          mistake, please contact the HR team directly.
        </p>
      </div>

      <div className="mt-8 w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-card animate-fade-up delay-100">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground leading-snug">
            Reach out to HR at <span className="font-medium text-foreground">hr@whippe.dev</span> to
            query your application status.
          </p>
        </div>
      </div>

      <div className="mt-6 w-full max-w-sm animate-fade-up delay-200">
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
