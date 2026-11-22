import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton";
import { WhippieLogo } from "@/components/shared/WhippieLogo";

export const metadata: Metadata = { title: "Create account — Whippie" };

const STEPS = [
  "Create your account",
  "Confirm your email",
  "HR checks you're on the programme",
];

export default function SignupPage() {
  return (
    <div className="min-h-[100dvh] bg-background sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="mx-auto w-full max-w-[440px]">
        <header className="flex h-16 items-center justify-between px-5 safe-top sm:px-1">
          <Link href="/login" className="flex items-center gap-2.5">
            <WhippieLogo size={26} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">Whippie</span>
          </Link>
          <Link href="/login" className="rounded-lg px-2 py-2 text-sm font-medium text-primary hover:underline">Sign in</Link>
        </header>

        <main className="px-5 pb-10 sm:px-0">
          <h1 className="pt-4 text-[28px] font-semibold leading-tight tracking-[-0.03em]">Create your account</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">
            For students on industrial training (SIWES / IT) and NYSC corps members at DAAR Communications.
          </p>

          <ol className="mt-5 flex flex-col gap-2 rounded-2xl bg-card px-4 py-3.5 text-sm dark:border">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-2xl bg-card p-5 dark:border">
            <GoogleAuthButton label="Sign up with Google" />
            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or with email</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <SignupForm />
          </div>

          <p className="mt-5 px-4 text-center text-xs leading-relaxed text-muted-foreground">
            Your details are only used to run your internship at DAAR Communications.
          </p>
        </main>
      </div>
    </div>
  );
}
