import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="px-4 pb-6 pt-5 space-y-5">
      {/* Greeting */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3 w-36" />
      </div>

      {/* Attendance card */}
      <Skeleton className="h-28 w-full" />

      {/* Stat pills */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>

      {/* Tasks card */}
      <Skeleton className="h-48 w-full" />

      {/* Progress */}
      <Skeleton className="h-40 w-full" />

      {/* Notifications */}
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
