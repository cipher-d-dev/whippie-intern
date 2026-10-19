/**
 * Auth API calls — thin wrappers over the shared api client.
 * Access token is stored in memory only (never localStorage/sessionStorage).
 */

import { api } from "@/lib/api/client";
import type { User, ApiResponse } from "@/types";

// ─── Shapes ───────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "INTERN";
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface RefreshResponseData {
  accessToken: string;
}

// ─── In-memory token store ────────────────────────────────────────────────────

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

/** Attach the stored access token to request headers */
export function authHeaders(): Record<string, string> {
  if (!_accessToken) return {};
  return { Authorization: `Bearer ${_accessToken}` };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function apiLogin(payload: LoginPayload) {
  const res = await api.post<ApiResponse<AuthResponseData>>(
    "/api/v1/auth/login",
    payload
  );
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function apiSignup(payload: SignupPayload) {
  const res = await api.post<ApiResponse<AuthResponseData>>(
    "/api/v1/auth/signup",
    payload
  );
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function apiRefresh() {
  const res = await api.post<ApiResponse<RefreshResponseData>>(
    "/api/v1/auth/refresh"
  );
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function apiLogout() {
  await api.post<unknown>("/api/v1/auth/logout", undefined, {
    headers: authHeaders(),
  });
  setAccessToken(null);
}

export async function apiGetMe() {
  const res = await api.get<ApiResponse<{ user: User }>>("/api/v1/auth/me", {
    headers: authHeaders(),
  });
  return res.data.user;
}

// ─── Email verification ───────────────────────────────────────────────────────

export async function apiVerifyEmail(token: string) {
  const res = await api.post<ApiResponse<null>>(
    "/api/v1/auth/verify-email",
    { token },
    { headers: authHeaders() },
  );
  return res;
}

export async function apiResendVerification(email: string) {
  await api.post<unknown>("/api/v1/auth/resend-verification", { email });
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function apiForgotPassword(email: string) {
  await api.post<unknown>("/api/v1/auth/forgot-password", { email });
}

export async function apiResetPassword(token: string, password: string) {
  await api.post<unknown>("/api/v1/auth/reset-password", { token, password });
}

// ─── Account linking ──────────────────────────────────────────────────────────

export async function apiLinkPassword(password: string) {
  await api.post<unknown>("/api/v1/auth/link-password", { password }, {
    headers: authHeaders(),
  });
}

export async function apiUnlinkGoogle() {
  await api.post<unknown>("/api/v1/auth/unlink-google", undefined, {
    headers: authHeaders(),
  });
}

export async function apiUnlinkPassword() {
  await api.post<unknown>("/api/v1/auth/unlink-password", undefined, {
    headers: authHeaders(),
  });
}
