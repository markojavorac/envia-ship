import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminPageTitleProps {
  /** Main title text */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Optional actions/buttons to render on the right */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AdminPageTitle - Desktop page title with optional actions
 *
 * Automatically applies correct admin styling:
 * - Title: text-2xl md:text-3xl font-bold text-foreground
 * - Description: text-muted-foreground
 * - Hidden on mobile (use inline header with SidebarTrigger instead)
 */
export function AdminPageTitle({ title, description, actions, className }: AdminPageTitleProps) {
  return (
    <div className={cn("hidden md:flex items-start justify-between gap-4", className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-foreground text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
