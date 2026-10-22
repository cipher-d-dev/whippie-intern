"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiSignup } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/api/client";
import { SESSION_QUERY_KEY } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";

const schema = z.object({
  firstName:       z.string().min(1, "Required"),
  lastName:        z.string().min(1, "Required"),
  email:           z.string().email("Enter a valid email"),
  password:        z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string().min(1, "Required"),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type FormValues = z.infer<typeof schema>;

const inputCls = (err: boolean) => cn(
  "w-full rounded-2xl border bg-muted/40 px-4 py-3 text-sm font-medium outline-none",
  "placeholder:text-muted-foreground/40 transition-all duration-150",
  err
    ? "border-destructive/50 bg-destructive/5"
    : "border-transparent hover:border-border focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/15",
);

export function SignupForm() {
  const router = useRouter();
  const qc     = useQueryClient();
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const signup = useMutation({
    mutationFn: ({ confirmPassword: _, ...v }: FormValues) => apiSignup({ ...v, role: "INTERN" }),
    onSuccess: (data) => { qc.setQueryData(SESSION_QUERY_KEY, data.user); router.replace("/verify-email"); },
    onError: (err) => {
      if (err instanceof ApiError && err.errors.length > 0) {
        err.errors.forEach(({ field, message }) => setError(field as keyof FormValues, { type: "server", message }));
        return;
      }
      toast.error(err instanceof ApiError ? err.message : "Signup failed.");
    },
  });

  const busy = isSubmitting || signup.isPending;
  const onSubmit = handleSubmit((v) => signup.mutate(v));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(e as any); }} className="space-y-3" noValidate>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-[13px] font-semibold text-foreground">First name</label>
          <input id="firstName" type="text" autoComplete="given-name" placeholder="Ada"
            {...register("firstName")} className={inputCls(!!errors.firstName)} />
          {errors.firstName && <p className="text-[11px] text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-[13px] font-semibold text-foreground">Last name</label>
          <input id="lastName" type="text" autoComplete="family-name" placeholder="Okafor"
            {...register("lastName")} className={inputCls(!!errors.lastName)} />
          {errors.lastName && <p className="text-[11px] text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-[13px] font-semibold text-foreground">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" aria-hidden />
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com"
            {...register("email")} className={cn(inputCls(!!errors.email), "pl-10")} />
        </div>
        {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label htmlFor="password" className="block text-[13px] font-semibold text-foreground">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" aria-hidden />
          <input id="password" type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Min 8 characters"
            {...register("password")} className={cn(inputCls(!!errors.password), "pl-10 pr-11")} />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
      </div>

      {/* Confirm */}
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-[13px] font-semibold text-foreground">Confirm password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" aria-hidden />
          <input id="confirmPassword" type={showCf ? "text" : "password"} autoComplete="new-password" placeholder="Repeat password"
            {...register("confirmPassword")} className={cn(inputCls(!!errors.confirmPassword), "pl-10 pr-11")} />
          <button type="button" onClick={() => setShowCf(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle">
            {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-[11px] text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="group w-full h-12 rounded-2xl text-[15px] font-bold shadow-violet-md mt-1" disabled={busy}>
        {busy
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <><span>Create account</span><ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
        }
      </Button>

      <p className="text-center text-[11px] text-muted-foreground leading-relaxed pt-1">
        For screened DAAR Communications interns and NYSC IT personnel only.
      </p>
    </form>
  );
}
