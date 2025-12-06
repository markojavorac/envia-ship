import { cn } from "@/lib/utils";

interface PackageProgressProps {
  loaded: number;
  total: number;
  className?: string;
}

/**
 * Visual progress bar showing package loading status
 *
 * Features:
 * - Animated progress fill (smooth transitions)
 * - Centered text overlay showing "loaded / total"
 * - Large typography for TV display readability
 * - Orange fill color matching brand
 */
export function PackageProgress({ loaded, total, className }: PackageProgressProps) {
  const percentage = total > 0 ? (loaded / total) * 100 : 0;

  return (
    <div className={cn("space-y-1", className)}>
      {/* Progress bar container */}
      <div className="bg-muted/30 border-border relative h-8 overflow-hidden rounded-md border">
        {/* Animated fill */}
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />

        {/* Text overlay (centered) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-foreground text-sm font-bold tabular-nums drop-shadow-sm">
            {loaded} / {total}
          </span>
        </div>
      </div>

      {/* Package count labels (below bar) */}
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>Packages</span>
        <span className="font-semibold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}
