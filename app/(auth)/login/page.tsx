import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Whippe Intern",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your intern account
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-xs text-muted-foreground animate-fade-up delay-300">
        Don&apos;t have an account?{" "}
        <a
          href="/signup"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Create one
        </a>
      </p>
    </div>
  );
}
