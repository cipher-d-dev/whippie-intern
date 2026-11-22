import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-xl bg-muted dark:bg-card", className)} {...props} />;
}

export { Skeleton };
