import * as React from "react";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

type InfoBoxVariant = "info" | "warning" | "error" | "success";

interface AdminInfoBoxProps {
  /** Content of the info box */
  children: React.ReactNode;
  /** Visual variant */
  variant?: InfoBoxVariant;
  /** Additional CSS classes */
  className?: string;
  /** Custom icon (overrides default) */
  icon?: React.ReactNode;
}

const VARIANT_STYLES = {
  info: {
    container: "bg-primary/10 border-primary",
    text: "text-foreground",
    icon: Info,
  },
  warning: {
    container: "bg-primary/10 border-primary",
    text: "text-primary",
    icon: AlertTriangle,
  },
  error: {
    container: "bg-destructive/10 border-destructive",
    text: "text-destructive",
    icon: AlertCircle,
  },
  success: {
    container: "bg-green-500/10 border-green-500",
    text: "text-green-500",
    icon: CheckCircle,
  },
} as const;

/**
 * AdminInfoBox - Dark theme enforced info/warning/error box
 *
 * Automatically applies correct admin styling:
 * - Info/Warning: bg-primary/10 border-l-4 border-primary
 * - Error: bg-destructive/10 border-l-4 border-destructive
 * - Success: bg-green-500/10 border-l-4 border-green-500
 */
export function AdminInfoBox({ children, variant = "info", className, icon }: AdminInfoBoxProps) {
  const styles = VARIANT_STYLES[variant];
  const IconComponent = styles.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border-l-4 p-3",
        styles.container,
        className
      )}
    >
      {icon || <IconComponent className={cn("mt-0.5 h-4 w-4 flex-shrink-0", styles.text)} />}
      <div className={cn("flex-1 text-sm", styles.text)}>{children}</div>
    </div>
  );
}
