import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton";

export const metadata: Metadata = { title: "Sign in — Whippe Intern" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 animate-fade-up">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your intern account</p>
      </div>

      {/* Google */}
      <div className="animate-fade-up delay-50">
        <GoogleAuthButton label="Sign in with Google" />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 animate-fade-up delay-100">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground animate-fade-up delay-300">
        No account yet?{" "}
        <a href="/signup" className="font-bold text-primary hover:underline underline-offset-4">
          Create one
        </a>
      </p>
    </div>
  );
}
