import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in — Whippie Intern" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 animate-fade-up">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Enter your email to continue</p>
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
