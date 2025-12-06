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
 * AdminPageTitle - Dark theme enforced page title
 *
 * Automatically applies correct admin styling:
 * - Title: text-2xl md:text-3xl font-bold text-foreground
 * - Description: text-muted-foreground
 */
export function AdminPageTitle({ title, description, actions, className }: AdminPageTitleProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h1 className="text-foreground text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
