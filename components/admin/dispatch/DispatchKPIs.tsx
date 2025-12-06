"use client";

import { useState, useEffect } from "react";
import { DispatchEntry } from "@/lib/admin/dispatch-types";
import { calculateDispatchMetrics } from "@/lib/admin/dispatch-utils";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Package, CheckCircle2 } from "lucide-react";

interface DispatchKPIsProps {
  entries: DispatchEntry[];
}

/**
 * KPI cards for dispatch terminal
 *
 * Shows 3 key metrics + large clock:
 * - Total Active Drivers (WAITING + LOADING + READY)
 * - Loading Now (LOADING count)
 * - Ready to Depart (READY count)
 * - Large real-time clock
 */
export function DispatchKPIs({ entries }: DispatchKPIsProps) {
  const metrics = calculateDispatchMetrics(entries);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard label="Active Drivers" value={metrics.totalActive} icon={Truck} />

      <StatsCard label="Loading Now" value={metrics.loadingNow} icon={Package} />

      <StatsCard label="Ready to Depart" value={metrics.readyToDepart} icon={CheckCircle2} />

      {/* Large Clock Card */}
      <Card className="bg-card border-border rounded-md">
        <CardContent className="flex flex-col items-center justify-center pt-8 pb-8">
          <div className="text-foreground text-6xl font-bold tabular-nums">{timeString}</div>
          <div className="text-muted-foreground mt-3 text-base">{dateString}</div>
        </CardContent>
      </Card>
    </div>
  );
}
