"use client";

/**
 * InstallPrompt — shows a native-style banner when the browser fires
 * the `beforeinstallprompt` event (Chrome/Edge on Android).
 *
 * Behaviour:
 *  - Hidden by default.
 *  - Appears at the bottom of the screen when the app is installable.
 *  - "Install" triggers the deferred prompt.
 *  - "Not now" dismisses for the session (stored in sessionStorage so it
 *    doesn't re-appear on every page change but comes back next session).
 *  - Disappears automatically once the app is installed
 *    (`appinstalled` event).
 */

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { WhippieLogo } from "@/components/shared/WhippieLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "whippie_install_dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible]               = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const installedHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Whippie"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-fade-up"
    >
      <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg">
        {/* Logo */}
        <div className="flex-shrink-0">
          <WhippieLogo size={36} />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Install Whippie</p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            Add it to your home screen to check in faster
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="press flex h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
