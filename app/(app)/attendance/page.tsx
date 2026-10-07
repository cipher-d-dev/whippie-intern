import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance — Whippe Intern",
};

/**
 * Attendance check-in page — Phase 6 will implement full attendance flow.
 * Scaffold placeholder only.
 */
export default function AttendancePage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Attendance</h1>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Attendance check-in — Phase 6
      </p>
    </div>
  );
}
