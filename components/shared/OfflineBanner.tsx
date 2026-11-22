"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * OfflineBanner — shown when the device loses network connectivity.
 * Listens to the browser's online/offline events.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [visible, setVisible] = useState(false); // delayed hide so transition plays

  useEffect(() => {
    const onOnline  = () => { setOffline(false); setTimeout(() => setVisible(false), 400); };
    const onOffline = () => { setOffline(true);  setVisible(true); };

    // Set initial state
    if (!navigator.onLine) { setOffline(true); setVisible(true); }

    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] safe-top",
        "flex items-center justify-center gap-2 px-4 py-2.5",
        "bg-foreground text-background text-xs font-medium",
        "transition-transform duration-300",
        offline ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <WifiOff className="h-3.5 w-3.5" />
      YouYou&apos;re offline — changes will not be saved until you reconnect.apos;re offline. Changes wonYou&apos;re offline — changes will not be saved until you reconnect.apos;t save until you reconnect.
    </div>
  );
}
