import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile — Whippe Intern",
};

/**
 * Profile page — Phase 1 will implement the full profile/account settings.
 * Scaffold placeholder only.
 */
export default function ProfilePage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Profile and account settings — Phase 1
      </p>
    </div>
  );
}
