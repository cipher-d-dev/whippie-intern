import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  /** Visual size of the spinner. Defaults to "md". */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
};

/**
 * LoadingSpinner — accessible inline loading indicator.
 */
export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-border border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}
