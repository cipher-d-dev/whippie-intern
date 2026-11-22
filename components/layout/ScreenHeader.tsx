"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

const circle = "press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-card text-foreground hover:bg-muted";

/** Big left-aligned title for a tab's root screen. */
export function TabHeader({ title, aside, className }: { title: string; aside?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("flex items-end justify-between gap-3 px-5 pb-4 pt-6", className)}>
      <h1 className="text-[28px] font-semibold leading-none tracking-[-0.03em]">{title}</h1>
      {aside && <div className="flex shrink-0 items-center gap-2 text-[13px] text-muted-foreground">{aside}</div>}
    </header>
  );
}

/** Centred title with a back (or close) button, for screens one level down. */
export function SubHeader({
  title,
  backHref,
  close,
  action,
}: {
  title: string;
  /** Where back goes when there is no history (e.g. opened from a push notification). */
  backHref: string;
  close?: boolean;
  action?: React.ReactNode;
}) {
  const router = useRouter();
  const Icon = close ? X : ChevronLeft;
  return (
    <header className="sticky top-0 z-40 grid grid-cols-[44px_1fr_auto] items-center gap-2 bg-background/95 px-4 py-3 backdrop-blur-md safe-top">
      <Link
        href={backHref}
        aria-label={close ? "Close" : "Back"}
        className={circle}
        onClick={(e) => {
          if (window.history.length > 1) {
            e.preventDefault();
            router.back();
          }
        }}
      >
        <Icon className="h-5 w-5" />
      </Link>
      <h1 className="truncate text-center text-base font-semibold">{title}</h1>
      <div className="flex min-w-[44px] justify-end">{action}</div>
    </header>
  );
}

export const headerIconButton = circle;
