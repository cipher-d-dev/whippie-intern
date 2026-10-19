"use client";

/**
 * Auth hooks — TanStack Query wrappers for session, login, signup, logout.
 *
 * Session flow:
 *   1. useSession calls GET /auth/me on mount.
 *   2. If 401, it tries POST /auth/refresh (silent token rotation).
 *   3. If refresh also fails, user is unauthenticated.
 *
 * Access token lives in `auth.api.ts` in-memory store.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  apiGetMe,
  apiLogin,
  apiLogout,
  apiRefresh,
  apiSignup,
  apiVerifyEmail,
  apiResendVerification,
  apiForgotPassword,
  apiResetPassword,
  type LoginPayload,
  type SignupPayload,
} from "./auth.api";
import { ApiError, applyApiErrors } from "@/lib/api/client";
import type { User } from "@/types";
import type { UseFormSetError } from "react-hook-form";

// ─── Session ──────────────────────────────────────────────────────────────────

export const SESSION_QUERY_KEY = ["session"] as const;

async function fetchSession(): Promise<User | null> {
  try {
    return await apiGetMe();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // Try silent refresh
      try {
        await apiRefresh();
        return await apiGetMe();
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function useSession(
  options?: Partial<UseQueryOptions<User | null>>
) {
  return useQuery<User | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,   // 5 minutes
    retry: false,
    ...options,
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export function useLogin(setError?: UseFormSetError<LoginPayload>) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => apiLogin(payload),
    onSuccess: (data) => {
      qc.setQueryData(SESSION_QUERY_KEY, data.user);
      const status = data.user.status;
      if (status === "UNVERIFIED_EMAIL") {
        router.replace("/verify-email");
      } else if (status === "PENDING_HR_VERIFICATION") {
        router.replace("/verification-pending");
      } else if (status === "REJECTED") {
        router.replace("/account-rejected");
      } else {
        router.replace("/home");
      }
    },
    onError: (err) => {
      if (setError && applyApiErrors(err, setError as Parameters<typeof applyApiErrors>[1])) return;
      const msg =
        err instanceof ApiError ? err.message : "Login failed. Try again.";
      toast.error(msg);
    },
  });
}

// ─── Signup ───────────────────────────────────────────────────────────────────

export function useSignup(setError?: UseFormSetError<SignupPayload>) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: SignupPayload) => apiSignup(payload),
    onSuccess: (data) => {
      qc.setQueryData(SESSION_QUERY_KEY, data.user);
      // New signups land in UNVERIFIED_EMAIL — redirect to verify-email page
      // (NOT /verification-pending, which is the HR approval step that comes later)
      router.replace("/verify-email");
    },
    onError: (err) => {
      if (setError && applyApiErrors(err, setError as Parameters<typeof applyApiErrors>[1])) return;
      const msg =
        err instanceof ApiError ? err.message : "Signup failed. Try again.";
      toast.error(msg);
    },
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiLogout(),
    onSettled: () => {
      qc.clear();
      router.replace("/login");
    },
  });
}

// ─── Email verification ───────────────────────────────────────────────────────

export function useVerifyEmail() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => apiVerifyEmail(token),
    onSuccess: () => {
      // Token verified — bump the session so the next render sees PENDING_HR_VERIFICATION
      void qc.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      router.replace("/verification-pending");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Verification failed. Try again.";
      toast.error(msg);
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => apiResendVerification(email),
    onSuccess: () => {
      toast.success("Verification email sent. Check your inbox.");
    },
    onError: () => {
      // Service always 200s — if we get here it's a network issue
      toast.error("Could not resend email. Check your connection.");
    },
  });
}

// ─── Forgot / reset password ──────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => apiForgotPassword(email),
    onSuccess: () => {
      // Don't toast here — the calling component handles the "email sent" UI
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, password }: ResetPasswordPayload) =>
      apiResetPassword(token, password),
    onSuccess: () => {
      toast.success("Password reset! You can now sign in.");
      router.replace("/login");
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Reset failed. Try again.";
      toast.error(msg);
    },
  });
}
