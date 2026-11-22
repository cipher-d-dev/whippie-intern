"use client";

import { BottomNav } from "./BottomNav";
import { usePushSubscription } from "@/features/notifications/push.hooks";

export function MobileShell({ children }: { children: React.ReactNode }) {
  // Subscribe to push notifications silently once the user is signed in.
  // The hook is idempotent and respects existing permission choices.
  usePushSubscription();

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-sm">
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <main id="main-content" className="flex-1 pb-24 safe-top" tabIndex={-1}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
