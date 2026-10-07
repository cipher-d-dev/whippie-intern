import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline — Whippe Intern",
};

/**
 * Internship timeline page — Phase 8 will implement the full timeline.
 * Scaffold placeholder only.
 */
export default function TimelinePage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Timeline</h1>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Internship timeline — Phase 8
      </p>
    </div>
  );
}
