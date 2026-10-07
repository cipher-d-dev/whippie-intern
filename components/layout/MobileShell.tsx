import { BottomNav } from "./BottomNav";

interface MobileShellProps {
  children: React.ReactNode;
}

/**
 * MobileShell — the outer layout for all authenticated intern screens.
 * Provides a scrollable content area above a fixed bottom nav bar.
 * Uses safe-area insets for notched/barred iOS and Android devices.
 */
export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Scrollable content area — padded to clear the fixed bottom nav */}
      <main
        id="main-content"
        className="flex-1 overflow-y-auto pb-20 safe-top"
        tabIndex={-1}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
