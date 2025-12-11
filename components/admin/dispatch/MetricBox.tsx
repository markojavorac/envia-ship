/**
 * MetricBox Component
 *
 * Displays a single metric with icon, value, and improvement percentage.
 * Used in RouteOptimizationResults to show business impact metrics.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricBoxProps {
  label: string;
  value: string;
  improvement?: string; // Percentage improvement (e.g., "25%")
  subtitle?: string; // Additional context (e.g., "Per route")
  icon: LucideIcon;
  variant?: "default" | "success" | "warning";
}

export function MetricBox({
  label,
  value,
  improvement,
  subtitle,
  icon: Icon,
  variant = "default",
}: MetricBoxProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border-2 p-4 transition-all",
        "bg-card border-border hover:border-primary/30"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 rounded-lg p-2",
          variant === "success" && "bg-green-500/10",
          variant === "warning" && "bg-yellow-500/10",
          variant === "default" && "bg-primary/10"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            variant === "success" && "text-green-500",
            variant === "warning" && "text-yellow-500",
            variant === "default" && "text-primary"
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-foreground text-2xl font-bold">{value}</p>
          {improvement && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-sm font-semibold",
                "bg-green-500/10 text-green-600"
              )}
            >
              {improvement}
            </span>
          )}
        </div>
        {subtitle && <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>}
      </div>
    </div>
  );
}
