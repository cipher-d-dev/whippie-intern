import type { ReactNode } from "react";

/**
 * Signup layout — bare (no card wrapper).
 * The signup page renders its own full-page design.
 */
export default function SignupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
