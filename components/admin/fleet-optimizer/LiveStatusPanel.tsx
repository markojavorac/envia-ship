"use client";

/**
 * Live Status Panel Component
 *
 * Shows active vehicles, available vehicles, and queued tickets.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type {
  FleetSimulationState,
  SimulatedVehicle,
} from "@/lib/admin/fleet-optimizer/simulation-types";
import {
  getActiveVehicles,
  getAvailableVehicles,
} from "@/lib/admin/fleet-optimizer/fleet-simulation";

interface LiveStatusPanelProps {
  simState: FleetSimulationState | null;
}

export function LiveStatusPanel({ simState }: LiveStatusPanelProps) {
  if (!simState) return null;

  const activeVehicles = getActiveVehicles(simState);
  const availableVehicles = getAvailableVehicles(simState);
  const { ticketQueue, autoReoptimizeThreshold } = simState;

  return (
    <div className="space-y-4">
      {/* Active Vehicles */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Truck className="h-5 w-5 text-green-600" />
            Active Vehicles ({activeVehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {activeVehicles.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active vehicles</p>
          ) : (
            <div className="space-y-2">
              {activeVehicles.map((vehicle) => (
                <VehicleStatusCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Vehicles */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Available at Depot ({availableVehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {availableVehicles.length === 0 ? (
            <p className="text-muted-foreground text-sm">No available vehicles</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-background border border-border"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vehicle.color }}
                  />
                  <span className="text-sm font-medium text-foreground">{vehicle.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {vehicle.packageCapacity} capacity
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Queue */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Clock className="h-5 w-5 text-orange-600" />
              Queued Tickets ({ticketQueue.length})
            </CardTitle>
            {ticketQueue.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Auto-reoptimize at {autoReoptimizeThreshold}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {ticketQueue.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tickets in queue</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ticketQueue.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 border-l-4 border-primary bg-background rounded"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{ticket.stop.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {formatDistanceToNow(ticket.addedAt, { addSuffix: true })}
                      </p>
                    </div>
                    {ticket.priority === "urgent" && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                    {ticket.stop.packageCount && ticket.stop.packageCount > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {ticket.stop.packageCount} pkgs
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Individual vehicle status card
 */
function VehicleStatusCard({ vehicle }: { vehicle: SimulatedVehicle }) {
  const getStatusBadge = () => {
    switch (vehicle.status) {
      case "en_route":
        return (
          <Badge className="bg-blue-600 text-white">
            En Route
          </Badge>
        );
      case "servicing":
        return (
          <Badge className="bg-yellow-600 text-white">
            Servicing
          </Badge>
        );
      case "returning":
        return (
          <Badge className="bg-purple-600 text-white">
            Returning
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vehicle.color }} />
        <div>
          <span className="font-medium text-foreground">{vehicle.label}</span>
          {vehicle.estimatedArrival && (
            <p className="text-xs text-muted-foreground mt-0.5">
              ETA: {format(vehicle.estimatedArrival, "HH:mm:ss")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusBadge()}
        <span className="text-sm text-foreground">
          {vehicle.completedStops} / {vehicle.completedStops + vehicle.remainingStops} stops
        </span>
      </div>
    </div>
  );
}
