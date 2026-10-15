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
      const status = data.user.accountStatus;
      if (status === "PENDING_HR_VERIFICATION") {
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
      // New accounts always land in pending state
      router.replace("/verification-pending");
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
