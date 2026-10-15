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

    if (user.status === "PENDING_HR_VERIFICATION") {
      router.replace("/verification-pending");
      return;
    }

    if (user.status === "REJECTED") {
      router.replace("/account-rejected");
      return;
    }
  }, [user, isLoading, router]);

  // While checking session — show nothing to prevent any flash
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo-light.png" alt="Whippie" width={56} height={56} className="animate-pulse dark:hidden" />
          <img src="/logo-dark.png"  alt="Whippie" width={56} height={56} className="animate-pulse hidden dark:block" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authed or wrong role — render nothing while redirect happens
  if (!user || user.role !== "INTERN" || user.status !== "ACTIVE") {
    return null;
  }

  return <MobileShell>{children}</MobileShell>;
}
