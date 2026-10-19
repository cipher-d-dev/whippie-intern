"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });
  const login = useLogin(setError);
  const busy  = isSubmitting || login.isPending;

  const onSubmit = handleSubmit((v) => login.mutate(v));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(e as any); }} className="space-y-4" noValidate>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[13px] font-semibold text-foreground">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" aria-hidden />
          <input
            id="email" type="email" autoComplete="email" placeholder="you@example.com"
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
        {errors.email && <p className="text-[11px] font-medium text-destructive animate-fade-up">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-[13px] font-semibold text-foreground">Password</label>
          <a href="/forgot-password" className="text-[11px] font-semibold text-primary hover:underline underline-offset-4">Forgot?</a>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" aria-hidden />
          <input
            id="password" type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
            {...register("password")}
            className={cn(
              "w-full rounded-2xl border bg-muted/40 pl-10 pr-11 py-3 text-sm font-medium outline-none",
              "placeholder:text-muted-foreground/40 transition-all duration-150",
              errors.password
                ? "border-destructive/50 bg-destructive/5"
                : "border-transparent hover:border-border focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/15",
            )}
          />
          <button
            type="button" onClick={() => setShowPw(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPw ? "Hide" : "Show"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] font-medium text-destructive animate-fade-up">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        className="group w-full h-12 rounded-2xl text-[15px] font-bold shadow-violet-md mt-2"
        disabled={busy}
      >
        {busy
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <><span>Sign in</span><ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" /></>
        }
      </Button>
    </form>
  );
}
