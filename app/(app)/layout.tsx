import { MobileShell } from "@/components/layout/MobileShell";

/**
 * App layout — wraps all authenticated intern screens in the mobile shell.
 * Authentication guard will be added in Phase 1 once auth is implemented.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
