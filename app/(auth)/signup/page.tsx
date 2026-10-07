import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account — Whippe Intern",
};

/**
 * Signup page — Phase 1 will implement Google + manual signup.
 * Scaffold placeholder only.
 */
export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Create your Whippe Intern account after completing AIT screening
        </p>
      </div>
      <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Account creation — Phase 1
      </p>
    </div>
  );
}
