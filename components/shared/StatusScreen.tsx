import type { ReactNode } from "react";
import { WhippieLogo } from "@/components/shared/WhippieLogo";
import { cn } from "@/lib/utils";

/** Full-screen page for an account state (waiting for HR, not approved, …). */
export function StatusScreen({
  icon,
  tone,
  title,
  children,
  actions,
}: {
  icon: ReactNode;
  tone: "warning" | "danger" | "info" | "success";
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const toneClass = {
    warning: "bg-warning-soft text-warning-foreground",
    danger: "bg-danger-soft text-danger-foreground",
    info: "bg-info-soft text-info-foreground",
    success: "bg-success-soft text-success-foreground",
  }[tone];
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-5 safe-top safe-bottom">
      <header className="mx-auto flex h-16 w-full max-w-[400px] items-center gap-2.5">
        <WhippieLogo size={26} />
        <span className="text-[17px] font-semibold tracking-[-0.02em]">Whippie</span>
      </header>
      <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center pb-10">
        <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl [&_svg]:h-7 [&_svg]:w-7", toneClass)}>{icon}</span>
        <h1 className="mt-5 text-[28px] font-semibold leading-tight tracking-[-0.03em]">{title}</h1>
        <div className="mt-2 space-y-4 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
        <div className="mt-8 space-y-2.5">{actions}</div>
      </main>
    </div>
  );
}
