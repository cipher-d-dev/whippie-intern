/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

/**
 * Custom service worker extension — merged by next-pwa into the generated SW.
 * Handles Web Push events so the app receives real-time push notifications
 * even when closed or in the background.
 */

// ─── push event ──────────────────────────────────────────────────────────────

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
  };

  try {
    payload = event.data.json() as typeof payload;
  } catch {
    // Fallback: treat raw text as body
    payload = { title: "Whippie", body: event.data.text() };
  }

  const notifOptions: NotificationOptions = {
    body:    payload.body,
    icon:    payload.icon  ?? "/icons/icon-192x192.png",
    badge:   payload.badge ?? "/icons/icon-192x192.png",
    tag:     payload.tag,
    data:    payload.data ?? {},
    // Vibrate: short-long-short pattern
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notifOptions),
  );
});

// ─── notificationclick event ──────────────────────────────────────────────────

self.addEventListener("notificationclick", (event: NotificationClickEvent) => {
  event.notification.close();

  // Navigate to /notifications (or a deep link if provided in data)
  const target: string =
    (event.notification.data as Record<string, string>)?.url ?? "/notifications";

  event.waitUntil(
    (self.clients as Clients)
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing window if one is already open
        for (const client of clientList) {
          if ("focus" in client) {
            void (client as WindowClient).focus();
            return;
          }
        }
        // Otherwise open a new window
        return (self.clients as Clients).openWindow(target);
      }),
  );
});
