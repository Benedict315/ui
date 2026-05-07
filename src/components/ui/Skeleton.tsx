import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as a circle (for avatars/icons) */
  circle?: boolean;
}

export function Skeleton({ circle, className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-2 animate-pulse shrink-0",
        circle ? "rounded-full" : "rounded-lg",
        className,
      )}
      {...props}
    />
  );
}

/** Pre-composed row skeleton: icon + two lines of text */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Skeleton circle className="w-9 h-9" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/** Pre-composed card skeleton: header + body lines */
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="px-5 py-5 flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
