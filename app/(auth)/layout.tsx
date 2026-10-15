import type { ReactNode } from "react";

/**
 * Auth layout — full-screen gradient shell for login / signup.
 * No bottom nav. Optimised for a one-handed mobile experience.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">
      {/* Ambient gradient blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-48 w-48 -translate-y-1/2 rounded-full bg-violet-300/10 blur-2xl" />
      </div>

      {/* Whippe wordmark */}
      <div className="mb-8 animate-fade-up text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-violet-md mb-3">
          <span className="text-xl font-extrabold text-white tracking-tight">W</span>
        </div>
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
          Intern Portal
        </p>
      </div>

      {/* Form card */}
      <div className="w-full max-w-sm animate-fade-up delay-100">
        <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
