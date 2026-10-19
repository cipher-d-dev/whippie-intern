"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";
import { OfflineBanner } from "./OfflineBanner";
import { InstallPrompt } from "./InstallPrompt";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,       // 1 minute
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        {children}

        <OfflineBanner />
        <InstallPrompt />

        {/* Toast — bottom of screen, mobile-friendly */}
        <Toaster
          position="bottom-center"
          expand={false}
          richColors
          toastOptions={{
            classNames: {
              toast:
                "font-sans rounded-2xl shadow-violet-md border border-border text-sm",
              title: "font-semibold",
              description: "text-muted-foreground",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
