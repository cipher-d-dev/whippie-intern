"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToPush, unsubscribeFromPush, getPushPermissionState } from "@/lib/push";

/**
 * usePushSubscription
 *
 * Call this inside the authenticated app shell (AppAuthGuard / MobileShell).
 * It silently attempts to subscribe the device to push notifications after
 * the user is known to be active.
 *
 * The hook is idempotent — safe to render on every route.
 */
export function usePushSubscription() {
  const attempted = useRef(false);
  const [state, setState] = useState<
    "idle" | "subscribed" | "already_subscribed" | "denied" | "unsupported" | "error"
  >("idle");

  useEffect(() => {
    // Only attempt once per mount
    if (attempted.current) return;
    attempted.current = true;

    // Don't prompt automatically — only subscribe if already granted,
    // or if the user hasn't been asked yet (we auto-prompt on first load).
    async function trySubscribe() {
      const permState = await getPushPermissionState();

      // If already denied, don't nag — respect the user's choice
      if (permState === "denied") {
        setState("denied");
        return;
      }

      if (permState === "unsupported") {
        setState("unsupported");
        return;
      }

      // "granted" or "prompt" — attempt subscription
      const result = await subscribeToPush();
      setState(result);
    }

    trySubscribe();
  }, []);

  return { state, unsubscribe: unsubscribeFromPush };
}
