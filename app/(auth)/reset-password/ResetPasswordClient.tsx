"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/lib/ui";

const schema = z.object({
  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .max(72, "Maximum 72 characters")
    .refine(
      (pw) => /[a-zA-Z]/.test(pw) && /\d/.test(pw),
      "Must contain at least one letter and one number",
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token        = searchParams.get("token");

  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);

  const resetPassword = useResetPassword();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const busy = isSubmitting || resetPassword.isPending;

  const inputCls = fieldClass;

  // No token in URL
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft">
          <AlertCircle className="h-8 w-8 text-danger-foreground" />
        </div>
        <div className="space-y-1">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">Invalid link</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This password reset link is invalid or has already been used.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="text-[13px] font-semibold text-primary hover:underline underline-offset-4"
        >
          Request a new reset link →
        </Link>
      </div>
    );
  }

  const onSubmit = handleSubmit((v) => {
    resetPassword.mutate({ token, password: v.password });
  });

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">New password</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Choose something strong — at least 8 characters with a number.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void onSubmit(e as unknown as React.FormEvent); }}
        className="space-y-4"
        noValidate
      >
        {/* New password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-[13px] font-medium text-foreground">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min 8 chars, include a number"
              {...register("password")}
              className={inputCls(!!errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPw ? "Hide" : "Show"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[13px] text-danger-foreground animate-fade-up">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-foreground">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showCf ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              {...register("confirmPassword")}
              className={inputCls(!!errors.confirmPassword)}
            />
            <button
              type="button"
              onClick={() => setShowCf((v) => !v)}
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showCf ? "Hide" : "Show"}
            >
              {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[13px] text-danger-foreground animate-fade-up">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg" className="group w-full"
          disabled={busy}
        >
          {busy
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : <><span>Set new password</span><ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
          }
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
