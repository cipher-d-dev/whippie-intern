import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">

      {/* Ambient gradient blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-56 w-56 -translate-y-1/2 rounded-full bg-violet-300/10 blur-2xl" />
      </div>

      {/* Logo mark */}
      <div className="mb-8 animate-fade-up flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary shadow-violet-lg">
          <span className="text-2xl font-black text-white tracking-tighter">W</span>
        </div>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          Intern Portal
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm animate-fade-up delay-100">
        <div className="rounded-3xl border border-border/50 bg-card/90 backdrop-blur-md p-7 shadow-[0_8px_40px_hsl(262_83%_58%/0.10)]">
          {children}
        </div>
      </div>
    </div>
  );
}
