import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton";
import { WhippieLogo } from "@/components/shared/WhippieLogo";

export const metadata: Metadata = { title: "Create account — Whippie Intern" };

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">

      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-56 w-56 rounded-full bg-indigo-400/8 blur-2xl" />
      </div>

      {/* Sticky top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border/40 bg-background/80 px-5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <WhippieLogo size={28} />
          <span className="text-sm font-bold tracking-tight text-foreground">Whippie</span>
        </div>
        <a
          href="/login"
          className="ml-auto text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </a>
      </header>

      {/* Scrollable content */}
      <main className="flex flex-1 flex-col items-center px-5 py-8">

        {/* Page heading */}
        <div className="w-full max-w-[440px] space-y-1 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
            DAAR Communications
          </p>
          <h1 className="text-[26px] font-black leading-tight tracking-tight text-foreground">
            Create your intern account
          </h1>
          <p className="text-sm text-muted-foreground">
            For screened interns &amp; NYSC IT personnel only.
          </p>
        </div>

        {/* Card */}
        <div className="mt-6 w-full max-w-[440px] animate-fade-up delay-50">
          <div className="rounded-[28px] border border-border/40 bg-card px-7 py-7 shadow-[0_2px_0px_hsl(262_18%_88%),0_16px_56px_hsl(262_83%_58%/0.08)] dark:shadow-[0_2px_0px_hsl(262_18%_18%),0_16px_56px_hsl(262_83%_65%/0.12)]">

            {/* Google */}
            <div className="animate-fade-up delay-75">
              <GoogleAuthButton label="Continue with Google" />
            </div>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3 animate-fade-up delay-100">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                or with email
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Form */}
            <SignupForm />
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 max-w-[340px] text-center text-[11px] leading-relaxed text-muted-foreground/70 animate-fade-up delay-300">
          By creating an account you agree to the Whippie intern programme
          terms. Your data is handled in accordance with DAAR Communications
          data policy.
        </p>

        <div className="h-8" />
      </main>
    </div>
  );
}
