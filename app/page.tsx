import { redirect } from "next/navigation";

/**
 * Root page — redirects to the main app home.
 * Authentication guard is handled inside the (app) layout.
 * Unauthenticated users will be redirected to /login from there.
 */
export default function RootPage() {
  redirect("/home");
}
