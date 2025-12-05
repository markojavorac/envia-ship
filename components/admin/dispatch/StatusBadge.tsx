import { DispatchStatus, DispatchPriority } from "@/lib/admin/dispatch-types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: DispatchStatus;
  priority?: DispatchPriority;
  className?: string;
}

/**
 * Color-coded status badge for dispatch terminal
 *
 * Visual styling:
 * - WAITING: Yellow (driver assigned, waiting for packages)
 * - LOADING: Blue (actively loading packages)
 * - READY: Green with pulse (fully loaded, ready to depart)
 * - DEPARTED: Gray (already left the hub)
 *
 * Urgent priority adds an orange left border accent
 */
export function StatusBadge({ status, priority = "normal", className }: StatusBadgeProps) {
  const isUrgent = priority === "urgent";

  // Status display text (WAITING becomes UPCOMING for clarity)
  const statusText: Record<DispatchStatus, string> = {
    [DispatchStatus.WAITING]: "UPCOMING",
    [DispatchStatus.LOADING]: "LOADING",
    [DispatchStatus.READY]: "READY",
    [DispatchStatus.DEPARTED]: "DEPARTED",
  };

  // Color schemes for each status (optimized for dark theme)
  const statusStyles: Record<DispatchStatus, string> = {
    [DispatchStatus.WAITING]: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    [DispatchStatus.LOADING]: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    [DispatchStatus.READY]: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 animate-pulse",
    [DispatchStatus.DEPARTED]: "bg-slate-500/15 text-slate-300 border-slate-500/40",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-md border-2 font-bold text-base tracking-wide transition-all",
        statusStyles[status],
        isUrgent && "border-l-4 border-l-primary",
        className
      )}
    >
      {statusText[status]}
    </div>
  );
}
