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
    <Card className="bg-card border-border hover:border-primary/50 transition-colors rounded-md">
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>

            {trend && (
              <div className="flex items-center gap-1 mt-2">
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
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}

            {badge && (
              <div className="mt-2">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                    badge.variant === "warning" && "bg-orange-500/5 text-orange-400/80 border border-orange-500/20",
                    badge.variant === "success" && "bg-green-500/5 text-green-400/80 border border-green-500/20",
                    badge.variant === "default" && "bg-primary/5 text-primary/80 border border-primary/20"
                  )}
                >
                  {badge.text}
                </span>
              </div>
            )}
          </div>

          <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
