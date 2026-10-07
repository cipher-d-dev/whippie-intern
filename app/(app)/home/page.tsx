import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home — Whippe Intern",
};

/**
 * Dashboard page — Phase 2 will implement the real intern dashboard.
 * Scaffold placeholder only.
 */
export default function HomePage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Home</h1>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Dashboard — Phase 2
      </p>
    </div>
  );
}
