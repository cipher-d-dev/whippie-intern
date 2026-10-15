"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignup } from "@/features/auth/auth.hooks";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName:  z.string().min(1, "Last name is required"),
    email:     z.string().email("Enter a valid email"),
    password:  z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

// signup payload only includes what the API expects
type SignupPayload = Omit<FormValues, "confirmPassword"> & { role: "INTERN" };

export function SignupForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const signup = useSignup(setError as Parameters<typeof useSignup>[0]);

  const onSubmit = ({ confirmPassword: _, ...values }: FormValues) => {
    const payload: SignupPayload = { ...values, role: "INTERN" };
    signup.mutate(payload);
  };

  const busy = isSubmitting || signup.isPending;

  const field = (
    id: keyof FormValues,
    label: string,
    type: string,
    placeholder: string,
    IconComponent: React.ElementType,
    autoComplete?: string,
  ) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <IconComponent
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          {...register(id)}
          className={cn(
            "w-full rounded-xl border bg-background px-4 py-2.5 pl-10 text-sm",
            "placeholder:text-muted-foreground/60 transition-colors duration-150",
            errors[id]
              ? "border-destructive/70 bg-destructive/5"
              : "border-input hover:border-primary/40",
          )}
        />
      </div>
      {errors[id] && (
        <p className="text-xs text-destructive animate-fade-up">
          {errors[id]?.message}
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 animate-fade-up delay-100"
      noValidate
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="firstName">First name</label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Ada"
            {...register("firstName")}
            className={cn(
              "w-full rounded-xl border bg-background px-3 py-2.5 text-sm",
              "placeholder:text-muted-foreground/60 transition-colors duration-150",
              errors.firstName
                ? "border-destructive/70 bg-destructive/5"
                : "border-input hover:border-primary/40",
            )}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Okafor"
            {...register("lastName")}
            className={cn(
              "w-full rounded-xl border bg-background px-3 py-2.5 text-sm",
              "placeholder:text-muted-foreground/60 transition-colors duration-150",
              errors.lastName
                ? "border-destructive/70 bg-destructive/5"
                : "border-input hover:border-primary/40",
            )}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {field("email",    "Email",            "email",    "you@example.com", Mail, "email")}
      {field("password", "Password",         "password", "Min 8 characters", Lock, "new-password")}
      {field("confirmPassword", "Confirm password", "password", "Repeat password", Lock, "new-password")}

      <Button type="submit" className="group w-full" size="lg" disabled={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Create account
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        By creating an account you confirm you are a screened DAAR Communications intern or NYSC IT personnel.
      </p>
    </form>
  );
}
