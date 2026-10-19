"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, XCircle } from "lucide-react";
import { setAccessToken, apiGetMe } from "@/features/auth/auth.api";
import { SESSION_QUERY_KEY } from "@/features/auth/auth.hooks";
import { WhippieLogo } from "@/components/shared/WhippieLogo";
import { Button } from "@/components/ui/button";

/**
 * GoogleSuccessHandler
 *
 * The API redirects here after Google OAuth:
 *   /auth/google/success#token=<accessToken>
 *
 * This page:
 *  1. Reads the access token from the URL fragment (never hits the server)
 *  2. Stores it in the in-memory token store
 *  3. Calls GET /auth/me to get the user
 *  4. Redirects based on account status
 */
export function GoogleSuccessHandler() {
  const router     = useRouter();
  const qc         = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handle() {
      // Read token from URL fragment
      const hash  = window.location.hash; // e.g. "#token=eyJ..."
      const token = new URLSearchParams(hash.slice(1)).get("token");

      if (!token) {
        // Check for error params on query string (redirect from API on failure)
        const params = new URLSearchParams(window.location.search);
        const err    = params.get("error");
        if (err === "account_rejected") {
          setError("Your account has been rejected. Contact HR.");
        } else if (err === "email_unverified_link_first") {
          setError("An account already exists with this email but it hasn't been verified yet. Sign in with your password first to link Google.");
        } else {
          setError("Google sign-in failed. Please try again.");
        }
        return;
      }

      try {
        // Store token in memory
        setAccessToken(token);

        // Fetch user
        const user = await apiGetMe();
        qc.setQueryData(SESSION_QUERY_KEY, user);

        // Redirect based on status + role
        if (user.role !== "INTERN") {
          setError("This app is for interns only. Please use the HR portal.");
          setAccessToken(null);
          return;
        }

        if (user.status === "PENDING_HR_VERIFICATION") {
          router.replace("/verification-pending");
        } else if (user.status === "REJECTED") {
          router.replace("/account-rejected");
        } else {
          router.replace("/home");
        }
      } catch {
        setError("Could not complete sign-in. Please try again.");
        setAccessToken(null);
      }
    }

    handle();
  }, [router, qc]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 bg-background">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-50 dark:bg-rose-900/20">
          <XCircle className="h-8 w-8 text-rose-500" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-foreground">Sign-in failed</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={() => router.replace("/login")}>
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
      <WhippieLogo size={56} />
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm font-medium">Completing sign-in...</p>
      </div>
    </div>
  );
}
