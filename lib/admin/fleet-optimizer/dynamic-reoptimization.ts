/**
 * Dynamic Reoptimization
 *
 * Handles reoptimization when new tickets are queued and vehicles become available.
 */

import type { RouteStop } from "../route-types";
import type { FleetConfig, VehicleRoute } from "../fleet-types";
import { VehicleSimulationStatus, type FleetSimulationState } from "./simulation-types";
import { optimizeFleetClarkeWright } from "./clarke-wright";

/**
 * Reoptimize with queued tickets and available vehicles
 */
export async function reoptimizeWithQueue(
  state: FleetSimulationState,
  depot: RouteStop,
  baseFleetConfig: FleetConfig
): Promise<{
  newRoutes: VehicleRoute[];
  assignedTickets: string[];
  remainingQueue: { id: string; stop: RouteStop; addedAt: Date; priority: "normal" | "urgent" }[];
}> {
  // Extract stops from queued tickets
  const queuedStops = state.ticketQueue.map((ticket) => ticket.stop);

  // Get only available vehicles
  const availableVehicles = state.vehicles.filter(
    (v) =>
      v.status === VehicleSimulationStatus.IDLE || v.status === VehicleSimulationStatus.COMPLETED
  );

  if (availableVehicles.length === 0 || queuedStops.length === 0) {
    return {
      newRoutes: [],
      assignedTickets: [],
      remainingQueue: state.ticketQueue,
    };
  }

  // Create sub-fleet with only available vehicles
  const availableFleet: FleetConfig = {
    ...baseFleetConfig,
    vehicles: availableVehicles.map((sv) => ({
      id: sv.id,
      vehicleTypeId: sv.vehicleTypeId,
      label: sv.label,
      packageCapacity: sv.packageCapacity,
      color: sv.color,
    })),
    depot,
  };

  // Run optimization
  const solution = await optimizeFleetClarkeWright(queuedStops, availableFleet);

  // Determine which tickets were successfully assigned
  const assignedStopIds = solution.routes.flatMap((r) => r.stops).map((s) => s.id);

  const assignedTickets = state.ticketQueue
    .filter((ticket) => assignedStopIds.includes(ticket.stop.id))
    .map((ticket) => ticket.id);

  const remainingQueue = state.ticketQueue.filter(
    (ticket) => !assignedStopIds.includes(ticket.stop.id)
  );

  return {
    newRoutes: solution.routes.filter((r) => !r.isEmpty),
    assignedTickets,
    remainingQueue,
  };
}

/**
 * Apply reoptimization results to simulation state
 * Updates vehicle status and routes
 */
export function applyReoptimization(
  state: FleetSimulationState,
  newRoutes: VehicleRoute[],
  assignedTickets: string[],
  remainingQueue: { id: string; stop: RouteStop; addedAt: Date; priority: "normal" | "urgent" }[],
  depot: RouteStop
): FleetSimulationState {
  const updatedVehicles = state.vehicles.map((vehicle) => {
    const newRoute = newRoutes.find((r) => r.vehicleId === vehicle.id);

    if (!newRoute) {
      // Vehicle not assigned a new route
      return vehicle;
    }

    // Vehicle was idle/completed, now has route
    return {
      ...vehicle,
      status: VehicleSimulationStatus.EN_ROUTE,
      assignedRoute: newRoute,
      currentStopIndex: 0,
      position: depot.coordinates, // Start at depot
      currentSegmentProgress: 0,
      completedStops: 0,
      remainingStops: newRoute.stops.length,
      serviceStartTime: null,
      estimatedArrival: new Date(Date.now() + 30000), // 30 seconds to first stop
    };
  });

  return {
    ...state,
    vehicles: updatedVehicles,
    ticketQueue: remainingQueue,
  };
}
