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
      className="fixed bottom-20 left-4 right-4 z-50 animate-fade-up"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-[0_8px_32px_hsl(262_83%_58%/0.15)] dark:shadow-[0_8px_32px_hsl(262_83%_65%/0.2)]">
        {/* Logo */}
        <div className="flex-shrink-0">
          <WhippieLogo size={36} />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-foreground leading-tight">Install Whippie</p>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            Add to your home screen for the best experience
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[12px] font-bold text-white active:scale-95 transition-transform"
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
