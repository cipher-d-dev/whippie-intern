"use client";

import { BottomNav } from "./BottomNav";
import { usePushSubscription } from "@/features/notifications/push.hooks";

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  // Subscribe to push notifications silently once the user is authenticated.
  // The hook is idempotent and respects existing permission choices.
  usePushSubscription();

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20">

      {/* Subtle modern ambient lighting backdrop */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-primary/6 blur-[90px] dark:bg-primary/10" />
        <div className="absolute top-1/2 -left-32 h-[380px] w-[380px] rounded-full bg-indigo-500/5 blur-[100px] dark:bg-indigo-500/8" />
      </div>

      {/* Centered mobile-first max container */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Scrollable content — pb-24 clears fixed bottom nav + safe area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto pb-24 safe-top"
          tabIndex={-1}
        >
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
