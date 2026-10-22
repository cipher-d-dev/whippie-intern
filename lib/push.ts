/**
 * Web Push subscription helpers for the Whippie Intern PWA.
 *
 * Flow:
 *  1. On app load (after user is ACTIVE), call `subscribeToPush()`.
 *  2. Fetches the VAPID public key from the API.
 *  3. Calls browser PushManager.subscribe() — browser shows permission prompt.
 *  4. POSTs the resulting PushSubscription to the API to persist it.
 *
 * The service worker (`public/sw.js`, extended below) handles the actual
 * `push` event and calls `self.registration.showNotification(...)`.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── urlBase64ToUint8Array ────────────────────────────────────────────────────
// Converts the URL-safe base64 VAPID public key to a Uint8Array for the browser API.

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ─── Fetch VAPID public key ───────────────────────────────────────────────────

async function fetchVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/notifications/vapid-public-key`);
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { vapidPublicKey?: string } };
    return body.data?.vapidPublicKey ?? null;
  } catch {
    return null;
  }
}

// ─── Persist subscription to API ─────────────────────────────────────────────

async function persistSubscription(sub: PushSubscription): Promise<void> {
  const json = sub.toJSON() as {
    endpoint: string;
    keys?: { p256dh?: string; auth?: string };
  };

  if (!json.keys?.p256dh || !json.keys?.auth) {
    console.warn("[push] Subscription missing keys — skipping persist");
    return;
  }

  await fetch(`${API_BASE}/api/v1/notifications/subscribe`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    }),
  });
}

// ─── Remove subscription from API ────────────────────────────────────────────

async function removeSubscription(endpoint: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/notifications/subscribe`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });
}

// ─── Main: subscribeToPush ────────────────────────────────────────────────────

/**
 * Requests push permission, subscribes the browser, and registers the
 * subscription with the API. Safe to call multiple times — idempotent.
 *
 * Returns: "subscribed" | "already_subscribed" | "denied" | "unsupported" | "error"
 */
export async function subscribeToPush(): Promise<
  "subscribed" | "already_subscribed" | "denied" | "unsupported" | "error"
> {
  // Check browser support
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }

  // Check existing permission
  const permission = await Notification.requestPermission();
  if (permission === "denied") return "denied";
  if (permission !== "granted") return "denied";

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      // Re-persist in case the server lost it
      await persistSubscription(existing).catch(() => {});
      return "already_subscribed";
    }

    // Fetch VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? await fetchVapidPublicKey();
    if (!vapidKey) {
      console.warn("[push] VAPID public key not available — push disabled");
      return "error";
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // Persist to API (fire-and-forget — don't block the UI)
    persistSubscription(subscription).catch((err) => {
      console.warn("[push] Failed to persist subscription:", err);
    });

    return "subscribed";
  } catch (err) {
    console.warn("[push] subscribeToPush error:", err);
    return "error";
  }
}

// ─── unsubscribeFromPush ──────────────────────────────────────────────────────

export async function unsubscribeFromPush(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await removeSubscription(endpoint).catch(() => {});
  } catch (err) {
    console.warn("[push] unsubscribeFromPush error:", err);
  }
}

// ─── getPushPermissionState ───────────────────────────────────────────────────

export async function getPushPermissionState(): Promise<
  "granted" | "denied" | "prompt" | "unsupported"
> {
  if (typeof window === "undefined") return "unsupported";
  if (!("PushManager" in window)) return "unsupported";
  if (!("permissions" in navigator)) {
    // Fallback: check Notification.permission
    const p = Notification.permission;
    return p === "default" ? "prompt" : p;
  }
  const status = await navigator.permissions.query({ name: "notifications" });
  return status.state as "granted" | "denied" | "prompt";
}
