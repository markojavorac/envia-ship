"use client";

import { TrendingUp, Clock, Zap, Target, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PerformanceMetric {
  driverId: string;
  driverName: string;
  totalTickets: number;
  totalCompleted: number;
  completionRate: number;
  avgDurationMinutes: number;
  fastestMinutes: number;
  slowestMinutes: number;
}

interface DriverPerformanceCardsProps {
  metrics: PerformanceMetric[];
  isLoading: boolean;
}

export function DriverPerformanceCards({ metrics, isLoading }: DriverPerformanceCardsProps) {
  const formatDuration = (minutes: number) => {
    if (minutes === 0) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (metrics.length === 0 && !isLoading) {
    return (
      <div className="border-border bg-card rounded-lg border p-8 text-center">
        <TrendingUp className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
        <p className="text-foreground font-semibold">No performance data yet</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Complete some deliveries to see driver metrics
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card
          key={metric.driverId}
          className="border-primary/30 bg-card border-2 transition-shadow hover:shadow-lg"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-base">{metric.driverName}</CardTitle>
                  <p className="text-muted-foreground text-xs">Driver Performance</p>
                </div>
              </div>
              <Badge
                variant={metric.completionRate >= 80 ? "default" : "secondary"}
                className="bg-primary/20 text-primary"
              >
                {metric.completionRate}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {/* Total Completed */}
            <div className="bg-muted/50 flex items-center justify-between rounded-md p-2">
              <div className="flex items-center gap-2">
                <Target className="text-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">Completed</span>
              </div>
              <span className="text-foreground font-semibold">
                {metric.totalCompleted} / {metric.totalTickets}
              </span>
            </div>

            {/* Average Duration */}
            <div className="bg-muted/50 flex items-center justify-between rounded-md p-2">
              <div className="flex items-center gap-2">
                <Clock className="text-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">Avg Time</span>
              </div>
              <span className="text-foreground font-semibold">
                {formatDuration(metric.avgDurationMinutes)}
              </span>
            </div>

            {/* Fastest */}
            <div className="bg-muted/50 flex items-center justify-between rounded-md p-2">
              <div className="flex items-center gap-2">
                <Zap className="text-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">Fastest</span>
              </div>
              <span className="text-foreground font-semibold">
                {formatDuration(metric.fastestMinutes)}
              </span>
            </div>

            {/* Slowest */}
            <div className="bg-muted/50 flex items-center justify-between rounded-md p-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary h-4 w-4" />
                <span className="text-muted-foreground text-sm">Slowest</span>
              </div>
              <span className="text-foreground font-semibold">
                {formatDuration(metric.slowestMinutes)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
