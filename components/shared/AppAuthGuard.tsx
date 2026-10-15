"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/auth.hooks";
import { MobileShell } from "@/components/layout/MobileShell";

/**
 * AppAuthGuard — client-side session gate for all (app) routes.
 *
 * Rules:
 *  - Loading       → show nothing (prevent flash)
 *  - No session    → /login
 *  - HR/SUPERVISOR → /login (wrong app)
 *  - PENDING       → /verification-pending
 *  - REJECTED      → /account-rejected
 *  - ACTIVE INTERN → render children inside MobileShell
 */
export function AppAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // This is the intern PWA — HR and supervisors do not belong here
    if (user.role !== "INTERN") {
      router.replace("/login");
      return;
    }

    if (user.accountStatus === "PENDING_HR_VERIFICATION") {
      router.replace("/verification-pending");
      return;
    }

    if (user.accountStatus === "REJECTED") {
      router.replace("/account-rejected");
      return;
    }
  }, [user, isLoading, router]);

  // While checking session — show nothing to prevent any flash
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary animate-pulse" />
          <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authed or wrong role — render nothing while redirect happens
  if (!user || user.role !== "INTERN" || user.accountStatus !== "ACTIVE") {
    return null;
  }

  return <MobileShell>{children}</MobileShell>;
}
