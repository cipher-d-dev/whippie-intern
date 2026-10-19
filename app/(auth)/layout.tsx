import type { ReactNode } from "react";
import { WhippieLogo } from "@/components/shared/WhippieLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-12">

      {/* Blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/18 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-400/12 blur-3xl" />
        <div className="absolute top-1/2 -left-16 h-48 w-48 -translate-y-1/2 rounded-full bg-violet-300/10 blur-2xl" />
      </div>

      {/* Logo + wordmark */}
      <div className="mb-7 flex flex-col items-center gap-3 animate-fade-up">
        <WhippieLogo size={60} />
        <div className="text-center">
          <p className="text-[13px] font-bold text-foreground tracking-tight">Whippie</p>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">Intern Portal</p>
        </div>
      </div>

      {/* Form card */}
      <div className="w-full max-w-[360px] animate-fade-up delay-100">
        <div className="rounded-[28px] border border-border/40 bg-card p-7 shadow-[0_2px_0px_hsl(262_18%_88%),0_12px_48px_hsl(262_83%_58%/0.08)]
          dark:shadow-[0_2px_0px_hsl(262_18%_18%),0_12px_48px_hsl(262_83%_65%/0.12)]">
          {children}
        </div>
      </div>
    </div>
  );
}
