import type { ReactNode } from "react";

/**
 * (status) route group — full-screen status pages that sit outside the
 * (auth) card layout. No card wrapper, no logo header — each page owns
 * its full layout.
 */
export default function StatusLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
