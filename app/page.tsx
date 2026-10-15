import { redirect } from "next/navigation";

/**
 * Root page — unauthenticated users go to login.
 * The auth guard in (app)/layout.tsx handles redirecting
 * already-authenticated users to /home after session check.
 */
export default function RootPage() {
  redirect("/login");
}
