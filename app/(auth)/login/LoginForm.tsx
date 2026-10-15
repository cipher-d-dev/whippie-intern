"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const login = useLogin(setError);

  const onSubmit = (values: FormValues) => {
    login.mutate(values);
  };

  const busy = isSubmitting || login.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 animate-fade-up delay-100"
      noValidate
    >
      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={cn(
              "w-full rounded-xl border bg-background px-4 py-2.5 pl-10 text-sm",
              "placeholder:text-muted-foreground/60",
              "transition-colors duration-150",
              errors.email
                ? "border-destructive/70 bg-destructive/5"
                : "border-input hover:border-primary/40",
            )}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive animate-fade-up">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground" htmlFor="password">
            Password
          </label>
          <a
            href="#"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className={cn(
              "w-full rounded-xl border bg-background px-4 py-2.5 pl-10 text-sm",
              "placeholder:text-muted-foreground/60",
              "transition-colors duration-150",
              errors.password
                ? "border-destructive/70 bg-destructive/5"
                : "border-input hover:border-primary/40",
            )}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive animate-fade-up">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="group w-full"
        size="lg"
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Sign in
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  );
}
