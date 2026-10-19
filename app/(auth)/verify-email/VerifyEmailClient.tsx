"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, XCircle, Loader2, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmail, useResendVerification, useLogout, useSession } from "@/features/auth/auth.hooks";

type VerifyState = "waiting"    // just signed up, showing "check your email"
                 | "verifying"  // token found in URL, POSTing to API
                 | "success"    // verified ok
                 | "error";     // invalid or expired

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token        = searchParams.get("token");

  const { data: user } = useSession();
  const verifyEmail  = useVerifyEmail();
  const resend       = useResendVerification();
  const logout       = useLogout();

  const [state, setState]    = useState<VerifyState>(token ? "verifying" : "waiting");
  const [errorMsg, setError] = useState<string>("");

  // ── Auto-verify when token appears in URL ────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setState("verifying");
    verifyEmail.mutate(token, {
      onSuccess: () => setState("success"),
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Verification failed. The link may have expired.";
        setError(msg);
        setState("error");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── VERIFYING ─────────────────────────────────────────────────────────────
  if (state === "verifying") {
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-[17px] font-extrabold tracking-tight text-foreground">Verifying…</p>
          <p className="text-sm text-muted-foreground">Confirming your email address.</p>
        </div>
      </div>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <p className="text-[17px] font-extrabold tracking-tight text-foreground">Email verified!</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your email is confirmed. HR will review your account shortly and you'll be notified by email.
          </p>
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/20">
          <XCircle className="h-8 w-8 text-rose-500" />
        </div>
        <div className="space-y-1">
          <p className="text-[17px] font-extrabold tracking-tight text-foreground">Link invalid</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {errorMsg || "This verification link is invalid or has expired."}
          </p>
        </div>
        {user?.email && (
          <Button
            className="w-full h-11 rounded-2xl font-bold"
            onClick={() => resend.mutate(user.email)}
            disabled={resend.isPending}
          >
            {resend.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><RefreshCw className="h-4 w-4 mr-2" />Resend verification email</>
            }
          </Button>
        )}
      </div>
    );
  }

  // ── WAITING (just signed up, no token yet) ────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/20 animate-float">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-[17px] font-extrabold tracking-tight text-foreground">Check your email</p>
          {user && (
            <p className="text-sm font-semibold text-foreground/80">Hi {user.firstName},</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a link to{" "}
            {user?.email
              ? <span className="font-semibold text-foreground">{user.email}</span>
              : "your email address"}.
            {" "}Click it to verify your email.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {["Open the email from Whippie.", 'Click "Verify my email".', "HR will then review your account."].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-[11px] font-bold text-primary">{i + 1}</span>
            </div>
            <p className="text-sm text-muted-foreground">{step}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        {user?.email && (
          <Button
            variant="outline"
            className="w-full h-11 rounded-2xl gap-2"
            onClick={() => resend.mutate(user.email)}
            disabled={resend.isPending || resend.isSuccess}
          >
            {resend.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : resend.isSuccess
                ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" />Email sent!</>
                : <><RefreshCw className="h-4 w-4" />Resend email</>
            }
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full h-11 rounded-2xl gap-2 text-muted-foreground text-[13px]"
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
