"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Providers — wraps the app with TanStack Query and any future global context.
 * Must be a client component because QueryClientProvider uses React context.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create the QueryClient once per browser session (not per render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Sensible defaults for a mobile PWA on variable networks
            staleTime: 60 * 1000, // 1 minute
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
