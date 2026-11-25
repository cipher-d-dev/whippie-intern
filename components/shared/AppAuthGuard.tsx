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
 *  - UNVERIFIED_EMAIL → /verify-email  (email not yet verified)
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

    if (user.status === "UNVERIFIED_EMAIL") {
      router.replace("/verify-email");
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
        {/* Same icon as the home-screen icon and splash, so opening the app looks continuous. */}
        <img src="/icons/icon-192x192.png" alt="Whippie" width={72} height={72} className="animate-pulse rounded-[22%] shadow-sm" />
      </div>
    );
  }

  // Not authed or wrong role — render nothing while redirect happens
  if (!user || user.role !== "INTERN" || user.status !== "ACTIVE") {
    return null;
  }

  return <MobileShell>{children}</MobileShell>;
}
