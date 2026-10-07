import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks — Whippe Intern",
};

/**
 * Tasks page — Phase 3 will implement task list, details and submissions.
 * Scaffold placeholder only.
 */
export default function TasksPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Tasks</h1>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Tasks and submissions — Phase 3
      </p>
    </div>
  );
}
