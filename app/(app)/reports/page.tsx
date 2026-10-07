import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports — Whippe Intern",
};

/**
 * Reports page — Phase 4 will implement report creation, editing and submission.
 * Scaffold placeholder only.
 */
export default function ReportsPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Reports — Phase 4
      </p>
    </div>
  );
}
