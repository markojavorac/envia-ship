/**
 * Navigation Timer Component
 *
 * Displays live elapsed time for active navigation or total time for completed deliveries.
 * Updates every second for active timers, shows static time for completed tickets.
 */

"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavigationTimerProps {
  /** Timestamp when navigation was started */
  navigationStartedAt?: Date;
  /** Timestamp when ticket was completed (stops the timer) */
  completedAt?: Date;
  /** Visual variant - inline for small displays, large for "up next" card */
  variant?: "inline" | "large";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format elapsed time in smart format
 * - MM:SS for durations < 60 minutes
 * - HH:MM:SS for durations ≥ 60 minutes
 */
function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Smart format: MM:SS for <60min, HH:MM:SS for ≥60min
  if (hours === 0) {
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format completed time in human-readable format
 * - "12m 34s" for < 60 minutes
 * - "1h 5m 23s" for ≥ 60 minutes
 */
function formatCompletedTime(startedAt: Date, completedAt: Date): string {
  const elapsedMs = completedAt.getTime() - startedAt.getTime();
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Human-readable format
  if (hours === 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * NavigationTimer - Live timer for active navigation or total time for completed tickets
 */
export function NavigationTimer({
  navigationStartedAt,
  completedAt,
  variant = "inline",
  className,
}: NavigationTimerProps) {
  const t = useTranslations("admin.driverAssist.timer");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer every second for active navigation
  useEffect(() => {
    // Skip interval if ticket is completed or no navigation start time
    if (completedAt || !navigationStartedAt) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [completedAt, navigationStartedAt]);

  // Don't render if no navigation start time
  if (!navigationStartedAt) {
    return null;
  }

  // Calculate elapsed time
  const elapsedMs = completedAt
    ? completedAt.getTime() - navigationStartedAt.getTime()
    : currentTime - navigationStartedAt.getTime();

  // Check if overdue (>24 hours)
  const isOverdue = elapsedMs > 24 * 60 * 60 * 1000;

  // Format display time
  const formattedTime = completedAt
    ? formatCompletedTime(navigationStartedAt, completedAt)
    : formatElapsedTime(elapsedMs);

  // Accessibility label
  const ariaLabel = t("elapsedTime", { time: formattedTime });

  // Render completed time (inline text next to "Done" badge)
  if (completedAt) {
    return (
      <span
        className={cn("text-muted-foreground flex items-center gap-1 text-sm", className)}
        aria-label={ariaLabel}
      >
        <Clock className="h-3.5 w-3.5" />
        {t("completedIn", { time: formattedTime })}
      </span>
    );
  }

  // Render active timer (badge format)
  if (variant === "large") {
    return (
      <Badge
        className={cn(
          "bg-primary/10 text-primary border-primary border-l-4 px-3 py-1.5 font-mono text-base",
          isOverdue && "bg-destructive/10 text-destructive border-destructive",
          className
        )}
        aria-label={ariaLabel}
      >
        <Clock className="mr-1.5 h-4 w-4" />
        <span className="flex items-center">
          {formattedTime.split(":")[0]}
          <span className="mx-0.5 animate-pulse">:</span>
          {formattedTime.split(":")[1]}
          {formattedTime.split(":")[2] && (
            <>
              <span className="mx-0.5 animate-pulse">:</span>
              {formattedTime.split(":")[2]}
            </>
          )}
        </span>
      </Badge>
    );
  }

  // Render inline timer (compact)
  return (
    <Badge
      className={cn(
        "bg-primary/10 text-primary border-primary border-l-4 px-2 py-0.5 font-mono text-sm",
        isOverdue && "bg-destructive/10 text-destructive border-destructive",
        className
      )}
      aria-label={ariaLabel}
    >
      <Clock className="mr-1 h-3.5 w-3.5" />
      <span className="flex items-center">
        {formattedTime.split(":")[0]}
        <span className="mx-0.5 animate-pulse">:</span>
        {formattedTime.split(":")[1]}
        {formattedTime.split(":")[2] && (
          <>
            <span className="mx-0.5 animate-pulse">:</span>
            {formattedTime.split(":")[2]}
          </>
        )}
      </span>
    </Badge>
  );
}
