/**
 * PWA utilities — helpers for install prompts, service-worker registration
 * awareness and offline state detection.
 *
 * Service-worker registration itself is handled by next-pwa.
 * These utilities are for app-level PWA interactions.
 */

/**
 * Returns true if the app is running in standalone/installed PWA mode.
 * Works on Android Chrome and iOS Safari.
 */
export function isInstalledPWA(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari standalone detection
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

/**
 * Returns true if the browser reports an active network connection.
 * This is a hint only — it does not guarantee the API is reachable.
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return window.navigator.onLine;
}

/**
 * BeforeInstallPromptEvent — not yet in standard lib types.
 */
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
