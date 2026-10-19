"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordClient() {
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo]       = useState("");

  const forgotPassword = useForgotPassword();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const busy = isSubmitting || forgotPassword.isPending;

  const onSubmit = handleSubmit((v) => {
    setSentTo(v.email);
    forgotPassword.mutate(v.email, {
      onSuccess: () => setSubmitted(true),
    });
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <p className="text-[17px] font-extrabold tracking-tight text-foreground">Check your inbox</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If an account exists for{" "}
            <span className="font-semibold text-foreground">{sentTo}</span>,
            a reset link has been sent. It expires in 60 minutes.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border/60 bg-muted/30 p-4 text-left space-y-2">
          <p className="text-[13px] font-semibold text-foreground">Didn't receive it?</p>
          {[
            "Check your spam folder.",
            "Make sure the email address is correct.",
            "Wait a minute — delivery can be delayed.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline underline-offset-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-[17px] font-extrabold tracking-tight text-foreground">Forgot password?</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enter your account email. If it exists, we'll send a reset link.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void onSubmit(e as unknown as React.FormEvent); }}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-[13px] font-semibold text-foreground">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" aria-hidden />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className={cn(
                "w-full rounded-2xl border bg-muted/40 pl-10 pr-4 py-3 text-sm font-medium outline-none",
                "placeholder:text-muted-foreground/40 transition-all duration-150",
                errors.email
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-transparent hover:border-border focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/15",
              )}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] font-medium text-destructive animate-fade-up">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="group w-full h-12 rounded-2xl text-[15px] font-bold shadow-violet-md"
          disabled={busy}
        >
          {busy
            ? <Loader2 className="h-5 w-5 animate-spin" />
            : <><span>Send reset link</span><ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
          }
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
