import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminCardProps extends React.ComponentProps<typeof Card> {
  /** Optional icon to display in header */
  icon?: LucideIcon;
  /** Card title */
  title?: string;
  /** Whether to apply hover effect */
  hoverable?: boolean;
}

/**
 * AdminCard - Dark theme enforced card component
 *
 * Automatically applies correct admin styling:
 * - bg-card (dark slate)
 * - border-border (subtle gray)
 * - hover:border-primary/50 transition
 */
export function AdminCard({
  children,
  className,
  icon: Icon,
  title,
  hoverable = true,
  ...props
}: AdminCardProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border rounded-md border",
        hoverable && "hover:border-primary/50 transition-colors",
        className
      )}
      {...props}
    >
      {(Icon || title) && (
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2 text-lg font-bold">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </CardTitle>
        </CardHeader>
      )}
      {children}
    </Card>
  );
}

export { CardContent as AdminCardContent };
