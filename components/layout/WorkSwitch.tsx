"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/** Tasks and Reports share the Work tab; this switches between them. */
export function WorkSwitch({ current }: { current: "tasks" | "reports" }) {
  return (
    <nav aria-label="Work" className="px-5 pb-4">
      <div className="flex rounded-full bg-muted p-1">
        {([["tasks", "Tasks", "/tasks"], ["reports", "Reports", "/reports"]] as const).map(([k, label, href]) => (
          <Link
            key={k}
            href={href}
            replace
            aria-current={current === k ? "page" : undefined}
            className={cn(
              "flex h-9 flex-1 items-center justify-center rounded-full text-[14px] font-medium transition-colors",
              current === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
