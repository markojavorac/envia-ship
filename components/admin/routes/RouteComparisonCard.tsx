"use client";

import { Card, CardContent } from "@/components/ui/card";
import { OptimizedRoute } from "@/lib/admin/route-types";
import { formatDistance, formatDuration } from "@/lib/admin/route-utils";
import { TrendingDown, Clock, MapIcon } from "lucide-react";

interface RouteComparisonCardProps {
  /** Optimized route with comparison metrics */
  optimizedRoute: OptimizedRoute;
}

export function RouteComparisonCard({ optimizedRoute }: RouteComparisonCardProps) {
  const {
    originalDistance,
    originalTime,
    totalDistance,
    totalTime,
    distanceSaved,
    timeSaved,
    improvementPercent,
  } = optimizedRoute;

  const hasImprovement = distanceSaved > 0;

  return (
    <Card className="bg-card border-border border">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-500" />
          <h3 className="text-foreground text-lg font-bold">Route Optimization Results</h3>
        </div>

        {/* Comparison Table */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {/* Before Column */}
          <div className="bg-muted border-border rounded-lg border p-4">
            <div className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
              Before (Original)
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapIcon className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-2xl font-bold">
                  {formatDistance(originalDistance)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-lg font-semibold">
                  {formatDuration(originalTime)}
                </span>
              </div>
            </div>
          </div>

          {/* After Column */}
          <div className="bg-muted rounded-lg border border-green-500 p-4">
            <div className="mb-2 text-xs font-semibold text-green-500 uppercase">
              After (Optimized)
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold text-green-500">
                  {formatDistance(totalDistance)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-lg font-semibold text-green-500">
                  {formatDuration(totalTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        {hasImprovement ? (
          <div className="bg-primary/10 border-primary rounded-lg border-l-4 p-4">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="text-3xl">💰</span>
              <span className="text-foreground text-lg font-bold">Savings</span>
            </div>
            <div className="text-center">
              <div className="text-foreground mb-1 text-2xl font-bold">
                {formatDistance(distanceSaved)} ({improvementPercent.toFixed(0)}%)
              </div>
              <div className="text-muted-foreground text-sm">{timeSaved} minutes saved</div>
            </div>
          </div>
        ) : (
          <div className="bg-muted border-border rounded-lg border p-4 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              ℹ️ This route is already optimal in the order entered
            </p>
          </div>
        )}

        {/* Additional Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted border-border rounded border p-2">
            <div className="text-muted-foreground text-xs">Stops</div>
            <div className="text-foreground text-lg font-bold">
              {optimizedRoute.optimizedStops.length}
            </div>
          </div>
          <div className="bg-muted border-border rounded border p-2">
            <div className="text-muted-foreground text-xs">Total Distance</div>
            <div className="text-foreground text-lg font-bold">{formatDistance(totalDistance)}</div>
          </div>
          <div className="bg-muted border-border rounded border p-2">
            <div className="text-muted-foreground text-xs">Est. Time</div>
            <div className="text-foreground text-lg font-bold">{formatDuration(totalTime)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
