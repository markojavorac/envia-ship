import { cn } from "@/lib/utils";

interface NumberBadgeProps {
  number: number;
  size?: "sm" | "lg";
  variant?: "default" | "muted" | "inverse";
}

/**
 * NumberBadge - Round numbered badge for ticket ordering
 * Shows ticket position in queue with accent color
 */
export function NumberBadge({ number, size = "sm", variant = "default" }: NumberBadgeProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        size === "sm" && "h-8 w-8 text-sm",
        size === "lg" && "h-10 w-10 text-base",
        variant === "default" && "bg-primary text-white",
        variant === "muted" && "bg-muted text-muted-foreground",
        variant === "inverse" && "text-primary bg-card"
      )}
    >
      {number}
    </div>
  );
}
