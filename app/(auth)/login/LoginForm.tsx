"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";

const schema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const login = useLogin(setError);
  const busy  = isSubmitting || login.isPending;

  return (
    <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-5" noValidate>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            id="email" type="email" autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={cn(
              "w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-sm font-medium",
              "placeholder:text-muted-foreground/50 outline-none",
              "transition-all duration-150",
              errors.email
                ? "border-destructive/60 bg-destructive/5 ring-1 ring-destructive/30"
                : "border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
            )}
          />
        </div>
        {errors.email && (
          <p className="text-xs font-medium text-destructive animate-fade-up">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-semibold text-foreground">
            Password
          </label>
          <a href="#" className="text-xs font-medium text-primary hover:underline underline-offset-4">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            id="password" type={showPw ? "text" : "password"} autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className={cn(
              "w-full rounded-xl border bg-background pl-10 pr-11 py-3 text-sm font-medium",
              "placeholder:text-muted-foreground/50 outline-none",
              "transition-all duration-150",
              errors.password
                ? "border-destructive/60 bg-destructive/5 ring-1 ring-destructive/30"
                : "border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20",
            )}
          />
          <button
            type="button" onClick={() => setShowPw((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-destructive animate-fade-up">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="group w-full h-12 text-base font-bold rounded-xl shadow-violet-md" disabled={busy}>
        {busy
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </>
        }
      </Button>
    </form>
  );
}
