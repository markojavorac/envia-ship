/* eslint-disable custom/no-admin-hardcoded-colors, custom/no-inline-styles */
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant: "default" | "warning" | "success";
  };
}

export function StatsCard({ label, value, icon: Icon, trend, badge }: StatsCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 rounded-md transition-colors">
      <CardContent className="px-4 pt-8 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground mb-2 text-base">{label}</p>
            <h3 className="text-foreground text-6xl font-bold">{value}</h3>

            {trend && (
              <div className="mt-2 flex items-center gap-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value.toFixed(1)}%
                </span>
                <span className="text-muted-foreground text-xs">vs last month</span>
              </div>
            )}

            {badge && (
              <div className="mt-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                    badge.variant === "warning" &&
                      "border border-orange-500/20 bg-orange-500/5 text-orange-400/80",
                    badge.variant === "success" &&
                      "border border-green-500/20 bg-green-500/5 text-green-400/80",
                    badge.variant === "default" &&
                      "bg-primary/5 text-primary/80 border-primary/20 border"
                  )}
                >
                  {badge.text}
                </span>
              </div>
            )}
          </div>

          <div className="bg-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
