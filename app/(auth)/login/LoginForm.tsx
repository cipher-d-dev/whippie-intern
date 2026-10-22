"use client";

/**
 * Smart login form — Section E: smart login detection.
 *
 * Flow:
 *  1. User types email and blurs/presses Continue.
 *  2. GET /auth/method?email=... → "password" | "google" | "both" | "none"
 *  3. Render appropriate UI:
 *       password → password field + sign-in button
 *       google   → "Continue with Google" only (no password field)
 *       both     → password field + Google button
 *       none     → "no account" message with sign-up link
 */

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/features/auth/auth.hooks";
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type AuthMethod = "password" | "google" | "both" | "none";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
const passwordSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof passwordSchema>;

const inputCls = (err: boolean) => cn(
  "w-full rounded-2xl border bg-muted/40 pl-10 pr-4 py-3 text-sm font-medium outline-none",
  "placeholder:text-muted-foreground/40 transition-all duration-150",
  err
    ? "border-destructive/50 bg-destructive/5"
    : "border-transparent hover:border-border focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/15",
);

export function LoginForm() {
  const [step,         setStep]         = useState<"email" | "method">("email");
  const [detectedEmail, setDetectedEmail] = useState("");
  const [method,       setMethod]       = useState<AuthMethod | null>(null);
  const [detecting,    setDetecting]    = useState(false);
  const [detectError,  setDetectError]  = useState("");
  const [showPw,       setShowPw]       = useState(false);

  const searchParams = useSearchParams();

  // Show Google OAuth error if we were redirected back here from the API
  useEffect(() => {
    const err = searchParams.get("error");
    if (!err) return;
    const messages: Record<string, string> = {
      account_rejected:           "Your account has been rejected. Contact HR.",
      email_unverified_link_first: "An account with this email exists but isn't verified yet. Sign in with your password to link Google.",
      google_failed:              "Google sign-in failed. Please try again.",
    };
    setDetectError(messages[err] ?? "Something went wrong. Please try again.");
  }, [searchParams]);

  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(passwordSchema) });
  const login = useLogin(setError);
  const busy  = isSubmitting || login.isPending;

  // ── Step 1: detect method for the entered email ────────────────────────────
  async function detectMethod(email: string) {
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setDetectError("Enter a valid email address.");
      return;
    }
    setDetectError("");
    setDetecting(true);
    try {
      const res = await api.get<ApiResponse<{ method: AuthMethod }>>(
        `/api/v1/auth/method?email=${encodeURIComponent(email)}`,
      );
      const m = res.data.method;
      setDetectedEmail(email);
      setValue("email", email);
      setMethod(m);
      setStep("method");
      // Auto-focus password field for password/both accounts
      if (m === "password" || m === "both") {
        setTimeout(() => passwordInputRef.current?.focus(), 80);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Could not reach server. Check your connection.";
      setDetectError(msg);
    } finally {
      setDetecting(false);
    }
  }

  const onSubmit = handleSubmit((v) => login.mutate(v));

  // ── Step 1 UI: email entry ─────────────────────────────────────────────────
  if (step === "email") {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email-step1" className="block text-[13px] font-semibold text-foreground">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" aria-hidden />
            <input
              id="email-step1"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); detectMethod((e.target as HTMLInputElement).value); } }}
              className={cn(inputCls(!!detectError), "pr-4")}
            />
          </div>
          {detectError && (
            <p className="text-[11px] font-medium text-destructive animate-fade-up">{detectError}</p>
          )}
        </div>

        <Button
          type="button"
          className="group w-full h-12 rounded-2xl text-[15px] font-bold shadow-violet-md"
          disabled={detecting}
          onClick={(e) => {
            const input = (e.currentTarget.closest(".space-y-4")?.querySelector("#email-step1") as HTMLInputElement);
            detectMethod(input?.value ?? "");
          }}
        >
          {detecting
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : <><span>Continue</span><ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
          }
        </Button>
      </div>
    );
  }

  // ── Step 2 UI: method-specific ─────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-up">
      {/* Email display + back button */}
      <button
        type="button"
        onClick={() => { setStep("email"); setMethod(null); }}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="truncate max-w-[240px]">{detectedEmail}</span>
      </button>

      {/* ── NONE: no account ── */}
      {method === "none" && (
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">No account found</p>
          <p className="text-[13px] text-muted-foreground">
            There's no Whippie account for <span className="font-medium text-foreground">{detectedEmail}</span>.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-1 text-[13px] font-bold text-primary hover:underline underline-offset-4"
          >
            Create an account →
          </Link>
        </div>
      )}

      {/* ── GOOGLE only ── */}
      {method === "google" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 dark:bg-amber-900/10 dark:border-amber-700/30 px-4 py-3">
            <p className="text-[13px] text-amber-700 dark:text-amber-400 font-medium leading-snug">
              This account uses Google sign-in — no password is set.
            </p>
          </div>
          <GoogleAuthButton label="Continue with Google" />
        </div>
      )}

      {/* ── PASSWORD or BOTH: show password field ── */}
      {(method === "password" || method === "both") && (
        <form
          onSubmit={(e) => { e.preventDefault(); void onSubmit(e as unknown as React.FormEvent); }}
          className="space-y-4"
          noValidate
        >
          {/* Hidden email for password managers */}
          <input type="hidden" {...register("email")} />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-[13px] font-semibold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-[11px] font-semibold text-primary hover:underline underline-offset-4">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" aria-hidden />
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                ref={(el) => {
                  // merge react-hook-form ref with our focus ref
                  const { ref } = register("password");
                  if (typeof ref === "function") ref(el);
                  (passwordInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                }}
                className={cn(inputCls(!!errors.password), "pr-11")}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPw ? "Hide" : "Show"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] font-medium text-destructive animate-fade-up">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="group w-full h-12 rounded-2xl text-[15px] font-bold shadow-violet-md"
            disabled={busy}
          >
            {busy
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : <><span>Sign in</span><ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></>
            }
          </Button>

          {/* BOTH: also offer Google */}
          {method === "both" && (
            <>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <GoogleAuthButton label="Sign in with Google" />
            </>
          )}
        </form>
      )}
    </div>
  );
}
