import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes — Whippe Intern",
};

/**
 * Notes / personal to-dos page — Phase 5 will implement notes and todos.
 * Scaffold placeholder only.
 */
export default function NotesPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Notes</h1>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Notes and to-dos — Phase 5
      </p>
    </div>
  );
}
