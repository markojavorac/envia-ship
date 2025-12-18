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
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
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
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
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
                  className="bg-background border-border flex items-center gap-2 rounded border px-3 py-2"
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: vehicle.color }}
                  />
                  <span className="text-foreground text-sm font-medium">{vehicle.label}</span>
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
            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
              <Clock className="h-5 w-5 text-orange-600" />
              Queued Tickets ({ticketQueue.length})
            </CardTitle>
            {ticketQueue.length > 0 && (
              <span className="text-muted-foreground text-sm">
                Auto-reoptimize at {autoReoptimizeThreshold}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {ticketQueue.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tickets in queue</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {ticketQueue.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border-primary bg-background rounded border-l-4 p-3"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">{ticket.stop.address}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
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
        return <Badge className="bg-blue-600 text-white">En Route</Badge>;
      case "servicing":
        return <Badge className="bg-yellow-600 text-white">Servicing</Badge>;
      case "returning":
        return <Badge className="bg-purple-600 text-white">Returning</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="bg-background border-border flex items-center justify-between rounded border p-3">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: vehicle.color }} />
        <div>
          <span className="text-foreground font-medium">{vehicle.label}</span>
          {vehicle.estimatedArrival && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              ETA: {format(vehicle.estimatedArrival, "HH:mm:ss")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusBadge()}
        <span className="text-foreground text-sm">
          {vehicle.completedStops} / {vehicle.completedStops + vehicle.remainingStops} stops
        </span>
      </div>
    </div>
  );
}
