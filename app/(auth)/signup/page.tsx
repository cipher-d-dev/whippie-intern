import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Create account — Whippe Intern" };

export default function SignupPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1 animate-fade-up">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground">
          For screened DAAR Communications interns &amp; NYSC IT personnel
        </p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-muted-foreground animate-fade-up delay-200">
        Already have an account?{" "}
        <a href="/login" className="font-bold text-primary hover:underline underline-offset-4">
          Sign in
        </a>
      </p>
    </div>
  );
}
