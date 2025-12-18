"use client";

/**
 * Fleet Metrics Component
 *
 * Displays summary statistics for fleet optimization solution.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Gauge, DollarSign, Leaf, Clock } from "lucide-react";
import type { FleetSolution } from "@/lib/admin/fleet-types";
import { calculateFleetSummary } from "@/lib/admin/fleet-optimizer/fleet-metrics";

interface FleetMetricsProps {
  solution: FleetSolution;
}

export function FleetMetrics({ solution }: FleetMetricsProps) {
  const summary = calculateFleetSummary(solution);

  const metrics = [
    {
      label: "Total Distance",
      value: summary.totalDistance,
      icon: Gauge,
      color: "text-blue-600",
    },
    {
      label: "Total Time",
      value: summary.totalTime,
      icon: Clock,
      color: "text-purple-600",
    },
    {
      label: "Vehicles Used",
      value: `${summary.vehiclesUsed} / ${summary.vehiclesAvailable}`,
      icon: Truck,
      color: "text-orange-600",
    },
    {
      label: "Total Packages",
      value: summary.totalPackages,
      icon: Package,
      color: "text-green-600",
    },
    {
      label: "Avg Utilization",
      value: summary.avgUtilization,
      icon: Gauge,
      color: "text-indigo-600",
    },
    {
      label: "Fuel Cost",
      value: summary.fuelCost,
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      label: "CO₂ Emissions",
      value: summary.co2Emissions,
      icon: Leaf,
      color: "text-emerald-600",
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-lg font-bold">Fleet Performance</CardTitle>
          <Badge variant="secondary" className="font-semibold">
            {solution.algorithm === "clarke-wright" && "Clarke-Wright"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Optimization completed in {summary.optimizationTime}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="border-border bg-background flex flex-col gap-2 rounded-lg border p-4"
            >
              <div className="flex items-center gap-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-muted-foreground text-xs font-medium">{metric.label}</span>
              </div>
              <span className="text-foreground text-lg font-bold">{metric.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
