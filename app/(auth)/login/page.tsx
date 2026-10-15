import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in — Whippe Intern" };

export default function LoginPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1 animate-fade-up">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your Whippe Intern account</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground animate-fade-up delay-200">
        No account yet?{" "}
        <a href="/signup" className="font-bold text-primary hover:underline underline-offset-4">
          Create one
        </a>
      </p>
    </div>
  );
}
