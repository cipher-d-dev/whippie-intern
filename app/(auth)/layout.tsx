import type { ReactNode } from "react";
import { WhippieLogo } from "@/components/shared/WhippieLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">

      {/* Ambient gradient blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-56 w-56 -translate-y-1/2 rounded-full bg-violet-300/10 blur-2xl" />
      </div>

      {/* Logo */}
      <div className="mb-8 animate-fade-up flex flex-col items-center gap-2">
        <WhippieLogo size={64} className="shadow-violet-lg" />
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
