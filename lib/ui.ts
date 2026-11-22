import { cn } from "@/lib/utils";

/** Text input used on the sign-in, sign-up and password screens. */
export const fieldClass = (err?: boolean) =>
  cn(
    "h-12 w-full rounded-xl border bg-card px-4 text-[15px] placeholder:text-muted-foreground/60 transition-colors",
    err ? "border-danger/60" : "border-input hover:border-muted-foreground/40",
  );

export const labelClass = "block text-[13px] font-medium text-foreground";
export const errorClass = "text-[13px] text-danger-foreground";
