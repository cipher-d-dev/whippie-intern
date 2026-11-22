import type { ReactNode } from "react";
import { WhippieLogo } from "@/components/shared/WhippieLogo";

/**
 * Blue brand panel on top, form on a white sheet below (phone).
 * On wider screens the sheet becomes a centred card.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-primary sm:items-center sm:justify-center sm:p-6">
      <div className="relative overflow-hidden px-6 pb-14 pt-8 text-primary-foreground safe-top sm:w-full sm:max-w-[420px] sm:px-0 sm:pb-8 sm:pt-0">
        <WhippieLogo tone="white" size={300} className="pointer-events-none absolute -right-20 -top-10 opacity-[0.1] dark:hidden sm:hidden" />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
            <WhippieLogo size={24} />
          </span>
          <span className="text-lg font-semibold tracking-[-0.02em]">Whippie</span>
        </div>
        <p className="relative mt-16 max-w-[300px] text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] sm:mt-6 sm:text-2xl">
          Your internship at DAAR, in your pocket.
        </p>
      </div>

      <main className="-mt-6 flex-1 rounded-t-[28px] bg-card px-6 pb-10 pt-8 safe-bottom sm:mt-0 sm:w-full sm:max-w-[420px] sm:flex-none sm:rounded-[28px] sm:p-8">
        {children}
      </main>
    </div>
  );
}
