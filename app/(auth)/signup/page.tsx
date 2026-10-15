import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create account — Whippe Intern",
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          For screened DAAR Communications interns
        </p>
      </div>

      <SignupForm />

      <p className="text-center text-xs text-muted-foreground animate-fade-up delay-300">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
