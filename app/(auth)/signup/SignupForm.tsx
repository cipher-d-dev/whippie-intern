"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiSignup } from "@/features/auth/auth.api";
import { ApiError, applyApiErrors } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";

const schema = z
  .object({
    firstName:       z.string().min(1, "First name is required"),
    lastName:        z.string().min(1, "Last name is required"),
    email:           z.string().email("Enter a valid email address"),
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const router     = useRouter();
  const qc         = useQueryClient();
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const signup = useMutation({
    mutationFn: ({ confirmPassword: _, ...values }: FormValues) =>
      apiSignup({ ...values, role: "INTERN" }),
    onSuccess: (data) => {
      qc.setQueryData(SESSION_QUERY_KEY, data.user);
      router.replace("/verification-pending");
    },
    onError: (err) => {
      if (err instanceof ApiError && err.errors.length > 0) {
        for (const { field, message } of err.errors) {
          setError(field as keyof FormValues, { type: "server", message });
        }
        return;
      }
      toast.error(err instanceof ApiError ? err.message : "Signup failed. Try again.");
    },
  });

  const busy = isSubmitting || signup.isPending;

  const onSubmit = handleSubmit((v) => signup.mutate(v));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(e); }}
      className="space-y-4"
      noValidate
    >

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName?.message}>
          <input
            id="firstName" type="text" autoComplete="given-name" placeholder="Ada"
            {...register("firstName")}
            className={inputCls(!!errors.firstName)}
          />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <input
            id="lastName" type="text" autoComplete="family-name" placeholder="Okafor"
            {...register("lastName")}
            className={inputCls(!!errors.lastName)}
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email address" error={errors.email?.message}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            id="email" type="email" autoComplete="email" placeholder="you@example.com"
            {...register("email")}
            className={cn(inputCls(!!errors.email), "pl-10")}
          />
        </div>
      </Field>

      {/* Password */}
      <Field label="Password" error={errors.password?.message}>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            id="password" type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Min 8 characters"
            {...register("password")}
            className={cn(inputCls(!!errors.password), "pl-10 pr-11")}
          />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      {/* Confirm password */}
      <Field label="Confirm password" error={errors.confirmPassword?.message}>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            id="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Repeat password"
            {...register("confirmPassword")}
            className={cn(inputCls(!!errors.confirmPassword), "pl-10 pr-11")}
          />
          <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" className="group w-full h-12 text-base font-bold rounded-xl shadow-violet-md" disabled={busy}>
        {busy
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <>
              Create account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </>
        }
      </Button>

      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        By continuing you confirm you are a screened DAAR Communications intern or NYSC IT personnel.
      </p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs font-medium text-destructive animate-fade-up">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-xl border bg-background px-4 py-3 text-sm font-medium outline-none",
    "placeholder:text-muted-foreground/50 transition-all duration-150",
    hasError
      ? "border-destructive/60 bg-destructive/5 ring-1 ring-destructive/30"
      : "border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
  );
}
