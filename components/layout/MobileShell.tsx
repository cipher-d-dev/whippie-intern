import { BottomNav } from "./BottomNav";

interface MobileShellProps {
  children: React.ReactNode;
}

/**
 * MobileShell — outer layout for all authenticated intern screens.
 * - Scrollable content area above the fixed bottom nav.
 * - Safe-area insets for notched iOS / Android devices.
 * - Subtle lavender background gradient for depth.
 */
export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Ambient background blob — same as whippie-web */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl dark:bg-violet-500/8" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-violet-400/5 blur-3xl dark:bg-violet-400/6" />
      </div>

      {/* Scrollable content — padded to clear the fixed bottom nav (h-16 + safe-area) */}
      <main
        id="main-content"
        className="flex-1 overflow-y-auto pb-24 safe-top"
        tabIndex={-1}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
