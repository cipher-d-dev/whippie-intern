import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Whippe Intern",
};

/**
 * Login page — Phase 1 will implement full auth UI.
 * Scaffold placeholder only.
 */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Whippe Intern account
        </p>
      </div>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Authentication — Phase 1
      </p>
    </div>
  );
}
