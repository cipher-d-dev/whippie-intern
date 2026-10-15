import { AppAuthGuard } from "@/components/shared/AppAuthGuard";

/**
 * App layout — wraps all authenticated intern screens.
 * AppAuthGuard checks session before rendering anything.
 * Unauthenticated or wrong-role users are redirected to /login.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppAuthGuard>{children}</AppAuthGuard>;
}
