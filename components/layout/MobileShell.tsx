"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { needsFacePhoto, useMyFace } from "@/features/face/face";
import { usePushSubscription } from "@/features/notifications/push.hooks";
import { useSession } from "@/features/auth/auth.hooks";
import { useChatConnection } from "@/features/chat/hooks";

export function MobileShell({ children }: { children: React.ReactNode }) {
  // Subscribe to push notifications silently once the user is signed in.
  // The hook is idempotent and respects existing permission choices.
  usePushSubscription();

  // Live chat updates and the unread badge, while signed in.
  const { data: user } = useSession();
  useChatConnection(user ? user._id ?? (user as unknown as { id: string }).id : undefined);

  // Face check is mandatory: anyone without a face photo (new interns on their
  // first visit, or existing interns) is taken to the face photo step first.
  const { data: face } = useMyFace();
  const mustTakePhoto = needsFacePhoto(face);
  const pathname = usePathname();
  const router = useRouter();
  const fullScreen = pathname === "/chat"; // the chat has its own header and message box
  useEffect(() => {
    if (mustTakePhoto && pathname !== "/face") router.replace("/face");
  }, [mustTakePhoto, pathname, router]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-sm">
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <main id="main-content" className={fullScreen ? "flex-1" : "flex-1 pb-24 safe-top"} tabIndex={-1}>
          {children}
        </main>
        {!mustTakePhoto && !fullScreen && <BottomNav />}
      </div>
    </div>
  );
}
