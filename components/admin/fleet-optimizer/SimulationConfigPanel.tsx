"use client";

/**
 * Simulation Configuration & Metrics Panel
 *
 * Displays real-time simulation metrics and configuration settings.
 * Shows current state, performance metrics, and constraint information.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  FleetSimulationState,
  SimulationConfig,
} from "@/lib/admin/fleet-optimizer/simulation-types";
import { VehicleSimulationStatus } from "@/lib/admin/fleet-optimizer/simulation-types";
import {
  Activity,
  Clock,
  Gauge,
  Package,
  Timer,
  TrendingUp,
  Truck,
  AlertCircle,
} from "lucide-react";

interface SimulationConfigPanelProps {
  simState: FleetSimulationState | null;
  config: SimulationConfig;
}

export function SimulationConfigPanel({ simState, config }: SimulationConfigPanelProps) {
  if (!simState) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="text-primary h-5 w-5" />
            Simulation Metrics
          </CardTitle>
          <CardDescription className="text-muted-foreground">No simulation running</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate metrics
  const totalVehicles = simState.vehicles.length;
  const activeVehicles = simState.vehicles.filter(
    (v) =>
      v.status === VehicleSimulationStatus.EN_ROUTE ||
      v.status === VehicleSimulationStatus.WAITING ||
      v.status === VehicleSimulationStatus.SERVICING ||
      v.status === VehicleSimulationStatus.RETURNING
  ).length;
  const waitingVehicles = simState.vehicles.filter(
    (v) => v.status === VehicleSimulationStatus.WAITING
  ).length;
  const idleVehicles = simState.vehicles.filter(
    (v) => v.status === VehicleSimulationStatus.IDLE
  ).length;
  const completedVehicles = simState.vehicles.filter(
    (v) => v.status === VehicleSimulationStatus.COMPLETED
  ).length;

  const totalStopsCompleted = simState.vehicles.reduce((sum, v) => sum + v.completedStops, 0);
  const totalStopsRemaining = simState.vehicles.reduce((sum, v) => sum + v.remainingStops, 0);
  const totalStops = totalStopsCompleted + totalStopsRemaining;
  const completionPercent =
    totalStops > 0 ? Math.round((totalStopsCompleted / totalStops) * 100) : 0;

  const queuedTickets = simState.ticketQueue.length;

  // Format simulation time
  const simTime = simState.currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground flex items-center gap-2">
          <Activity className="text-primary h-5 w-5" />
          Simulation Metrics
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Real-time simulation state and configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-sm font-semibold">Status</span>
            <Badge
              variant={simState.isRunning ? "default" : "secondary"}
              className={simState.isRunning ? "bg-green-600" : ""}
            >
              {simState.isRunning ? "Running" : "Paused"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              Simulation Time
            </span>
            <span className="text-foreground font-mono text-sm">{simTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1 text-sm">
              <Gauge className="h-4 w-4" />
              Speed
            </span>
            <span className="text-primary text-sm font-semibold">{simState.simulationSpeed}x</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Fleet Metrics */}
        <div className="space-y-2">
          <h4 className="text-foreground flex items-center gap-1 text-sm font-semibold">
            <Truck className="text-primary h-4 w-4" />
            Fleet Status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <MetricItem
              label="Active"
              value={activeVehicles}
              total={totalVehicles}
              color="text-green-600"
            />
            <MetricItem
              label="Waiting"
              value={waitingVehicles}
              total={totalVehicles}
              color="text-yellow-600"
            />
            <MetricItem
              label="Idle"
              value={idleVehicles}
              total={totalVehicles}
              color="text-muted-foreground"
            />
            <MetricItem
              label="Completed"
              value={completedVehicles}
              total={totalVehicles}
              color="text-blue-600"
            />
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Delivery Metrics */}
        <div className="space-y-2">
          <h4 className="text-foreground flex items-center gap-1 text-sm font-semibold">
            <Package className="text-primary h-4 w-4" />
            Delivery Progress
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Completed</span>
              <span className="text-sm font-semibold text-green-600">{totalStopsCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Remaining</span>
              <span className="text-foreground text-sm font-semibold">{totalStopsRemaining}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4" />
                Progress
              </span>
              <span className="text-primary text-sm font-semibold">{completionPercent}%</span>
            </div>
            {/* Progress bar */}
            <div className="bg-muted h-2 w-full rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Queue Status */}
        <div className="space-y-2">
          <h4 className="text-foreground flex items-center gap-1 text-sm font-semibold">
            <AlertCircle className="text-primary h-4 w-4" />
            Queue Status
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Queued Tickets</span>
            <Badge
              variant={queuedTickets >= config.reoptimizeThreshold ? "destructive" : "secondary"}
            >
              {queuedTickets}
            </Badge>
          </div>
          {simState.ticketGenerationEnabled && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Activity className="h-3 w-3" />
              Auto-generation enabled
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Configuration */}
        <div className="space-y-2">
          <h4 className="text-foreground flex items-center gap-1 text-sm font-semibold">
            <Timer className="text-primary h-4 w-4" />
            Configuration
          </h4>
          <div className="space-y-1.5">
            <ConfigItem
              label="Segment Duration"
              value={`${config.segmentDuration / 1000}s`}
              description="Time to travel between stops"
            />
            <ConfigItem
              label="Service Duration"
              value={`${config.serviceDuration / 1000}s`}
              description="Time spent at each stop"
            />
            <ConfigItem
              label="Reoptimize Threshold"
              value={`${config.reoptimizeThreshold} tickets`}
              description="Trigger reoptimization when queue reaches"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for metric items
function MetricItem({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`text-lg font-bold ${color}`}>
        {value}
        <span className="text-muted-foreground ml-1 text-xs">/ {total}</span>
      </span>
    </div>
  );
}

// Helper component for config items
function ConfigItem({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <div className="text-foreground text-xs font-medium">{label}</div>
        <div className="text-muted-foreground text-xs">{description}</div>
      </div>
      <Badge variant="outline" className="font-mono text-xs">
        {value}
      </Badge>
    </div>
  );
}
