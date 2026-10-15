import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton";

export const metadata: Metadata = { title: "Create account — Whippe Intern" };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 animate-fade-up">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground">
          For screened DAAR Communications interns &amp; NYSC IT personnel
        </p>
      </div>

      {/* Google */}
      <div className="animate-fade-up delay-50">
        <GoogleAuthButton label="Sign up with Google" />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 animate-fade-up delay-100">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or sign up with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <SignupForm />

      <p className="text-center text-sm text-muted-foreground animate-fade-up delay-300">
        Already have an account?{" "}
        <a href="/login" className="font-bold text-primary hover:underline underline-offset-4">
          Sign in
        </a>
      </p>
    </div>
  );
}
