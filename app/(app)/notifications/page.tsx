import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications — Whippe Intern",
};

/**
 * Notifications page — Phase 7 will implement notification list and navigation.
 * Scaffold placeholder only.
 */
export default function NotificationsPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Notifications</h1>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Notifications — Phase 7
      </p>
    </div>
  );
}
