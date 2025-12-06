import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getConfidenceIndicator, type ConfidenceLevel } from "@/lib/types/product-analysis";

interface ConfidenceIndicatorProps {
  confidence: ConfidenceLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ConfidenceIndicator({
  confidence,
  showLabel = true,
  size = "md",
}: ConfidenceIndicatorProps) {
  const indicator = getConfidenceIndicator(confidence);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const colorClasses = {
    red: "text-red-500",
    orange: "text-orange-500",
    yellow: "text-yellow-500",
    green: "text-green-500",
    emerald: "text-emerald-500",
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Star Rating */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < indicator.stars
                ? `fill-${indicator.color}-500 ${colorClasses[indicator.color]}`
                : "text-gray-300"
            )}
          />
        ))}
      </div>

      {/* Label */}
      {showLabel && (
        <span className={cn(textSizeClasses[size], "font-medium", colorClasses[indicator.color])}>
          {indicator.label}
        </span>
      )}

      {/* Percentage Badge */}
      <span className={cn(textSizeClasses[size], "text-muted-foreground")}>
        ({(confidence * 100).toFixed(0)}%)
      </span>
    </div>
  );
}
