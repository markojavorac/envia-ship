/**
 * Fleet Simulation Engine
 *
 * Core simulation logic for real-time fleet tracking and route progression.
 * Reuses patterns from driver-tracking/simulation.ts
 */

import type { Coordinates } from "../route-types";
import type { FleetSolution } from "../fleet-types";
import {
  VehicleSimulationStatus,
  type SimulatedVehicle,
  type FleetSimulationState,
  type SimulationConfig,
  type QueuedTicket,
} from "./simulation-types";

/**
 * Interpolate position between two coordinates based on progress (0-1)
 * Copied from driver-tracking/simulation.ts
 */
export function interpolatePosition(
  start: Coordinates,
  end: Coordinates,
  progress: number
): Coordinates {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return {
    lat: start.lat + (end.lat - start.lat) * clampedProgress,
    lng: start.lng + (end.lng - start.lng) * clampedProgress,
  };
}

/**
 * Calculate ETA for next stop based on current progress and speed
 */
function calculateETA(
  segmentProgress: number,
  config: SimulationConfig,
  simulationSpeed: number
): Date {
  const remainingProgress = 1 - segmentProgress;
  const remainingTime = (config.segmentDuration * remainingProgress) / simulationSpeed;

  return new Date(Date.now() + remainingTime);
}

/**
 * Initialize simulation from optimization solution
 */
export function initializeSimulation(
  solution: FleetSolution,
  config: SimulationConfig,
  depotPosition: Coordinates
): FleetSimulationState {
  const vehicles: SimulatedVehicle[] = solution.routes.map((route) => {
    const isIdle = route.isEmpty;

    return {
      // Base vehicle properties
      id: route.vehicleId,
      vehicleTypeId: route.vehicleId.split("-")[0], // Extract type from ID
      label: route.vehicleLabel || route.vehicleId,
      packageCapacity: route.capacity,
      color: route.vehicleColor || "#FF8C00",

      // Simulation state
      status: isIdle ? VehicleSimulationStatus.IDLE : VehicleSimulationStatus.EN_ROUTE,
      assignedRoute: isIdle ? null : route,
      currentStopIndex: 0,
      position: depotPosition, // All vehicles start at depot
      currentSegmentProgress: 0,
      serviceStartTime: null,
      estimatedArrival: isIdle ? null : calculateETA(0, config, 1),
      completedStops: 0,
      remainingStops: route.stops.length,
    };
  });

  return {
    vehicles,
    ticketQueue: [],
    isRunning: false,
    simulationSpeed: 1,
    currentTime: new Date(),
    ticketGenerationEnabled: false,
    autoReoptimizeThreshold: config.reoptimizeThreshold,
  };
}

/**
 * Update simulation state (called every interval)
 */
export function updateSimulation(
  state: FleetSimulationState,
  deltaTime: number,
  config: SimulationConfig,
  depotPosition: Coordinates
): FleetSimulationState {
  const updatedVehicles = state.vehicles.map((vehicle) =>
    updateVehiclePosition(vehicle, deltaTime, config, state.simulationSpeed, depotPosition)
  );

  return {
    ...state,
    vehicles: updatedVehicles,
    currentTime: new Date(state.currentTime.getTime() + deltaTime * state.simulationSpeed),
  };
}

/**
 * Update single vehicle position along route
 */
export function updateVehiclePosition(
  vehicle: SimulatedVehicle,
  deltaTime: number,
  config: SimulationConfig,
  simulationSpeed: number,
  depotPosition: Coordinates
): SimulatedVehicle {
  // No update for idle or completed vehicles
  if (
    vehicle.status === VehicleSimulationStatus.IDLE ||
    vehicle.status === VehicleSimulationStatus.COMPLETED
  ) {
    return vehicle;
  }

  // SERVICING state - wait for service duration
  if (vehicle.status === VehicleSimulationStatus.SERVICING) {
    const elapsed = Date.now() - (vehicle.serviceStartTime ?? 0);

    if (elapsed >= config.serviceDuration) {
      // Service complete, move to next stop
      const nextStopIndex = vehicle.currentStopIndex + 1;
      const hasMoreStops = vehicle.assignedRoute && nextStopIndex < vehicle.assignedRoute.stops.length;

      return {
        ...vehicle,
        status: hasMoreStops
          ? VehicleSimulationStatus.EN_ROUTE
          : VehicleSimulationStatus.RETURNING,
        currentStopIndex: hasMoreStops ? nextStopIndex : vehicle.currentStopIndex,
        completedStops: vehicle.completedStops + 1,
        remainingStops: Math.max(0, vehicle.remainingStops - 1),
        currentSegmentProgress: 0,
        serviceStartTime: null,
        estimatedArrival: hasMoreStops ? calculateETA(0, config, simulationSpeed) : null,
      };
    }

    // Still servicing
    return vehicle;
  }

  if (!vehicle.assignedRoute) {
    return vehicle;
  }

  const route = vehicle.assignedRoute;

  // RETURNING state - returning to depot
  if (vehicle.status === VehicleSimulationStatus.RETURNING) {
    // Last stop is the final stop in the route
    const lastStop = route.stops[route.stops.length - 1];
    const progressDelta = deltaTime / config.segmentDuration;
    const newProgress = Math.min(1, vehicle.currentSegmentProgress + progressDelta);

    if (newProgress >= 1) {
      // Arrived at depot
      return {
        ...vehicle,
        status: VehicleSimulationStatus.COMPLETED,
        position: depotPosition,
        currentSegmentProgress: 0,
        estimatedArrival: null,
      };
    }

    // Update position toward depot
    return {
      ...vehicle,
      currentSegmentProgress: newProgress,
      position: interpolatePosition(lastStop.coordinates, depotPosition, newProgress),
      estimatedArrival: calculateETA(newProgress, config, simulationSpeed),
    };
  }

  // EN_ROUTE state - moving to next stop
  const targetStopIndex = vehicle.currentStopIndex;
  const targetStop = route.stops[targetStopIndex];

  if (!targetStop) {
    // No target stop, transition to returning
    return {
      ...vehicle,
      status: VehicleSimulationStatus.RETURNING,
      currentSegmentProgress: 0,
    };
  }

  // Determine start position: depot if first stop, otherwise previous stop
  const startPosition =
    targetStopIndex === 0 ? depotPosition : route.stops[targetStopIndex - 1].coordinates;

  // Calculate progress along current segment
  const progressDelta = deltaTime / config.segmentDuration;
  const newProgress = Math.min(1, vehicle.currentSegmentProgress + progressDelta);

  // Check if reached stop (95% threshold)
  if (newProgress >= 0.95) {
    // Arrived at target stop, start servicing
    return {
      ...vehicle,
      status: VehicleSimulationStatus.SERVICING,
      position: targetStop.coordinates,
      currentSegmentProgress: 0,
      serviceStartTime: Date.now(),
      estimatedArrival: null,
    };
  }

  // Update position along segment (from start to target)
  return {
    ...vehicle,
    currentSegmentProgress: newProgress,
    position: interpolatePosition(startPosition, targetStop.coordinates, newProgress),
    estimatedArrival: calculateETA(newProgress, config, simulationSpeed),
  };
}

/**
 * Add new ticket to queue
 */
export function addTicketToQueue(
  state: FleetSimulationState,
  ticket: QueuedTicket
): FleetSimulationState {
  return {
    ...state,
    ticketQueue: [...state.ticketQueue, ticket],
  };
}

/**
 * Check if reoptimization should be triggered
 */
export function shouldReoptimize(state: FleetSimulationState): boolean {
  const availableVehicles = state.vehicles.filter(
    (v) => v.status === VehicleSimulationStatus.IDLE || v.status === VehicleSimulationStatus.COMPLETED
  );

  return (
    state.ticketQueue.length >= state.autoReoptimizeThreshold && availableVehicles.length > 0
  );
}

/**
 * Get available vehicles for reoptimization
 */
export function getAvailableVehicles(state: FleetSimulationState): SimulatedVehicle[] {
  return state.vehicles.filter(
    (v) => v.status === VehicleSimulationStatus.IDLE || v.status === VehicleSimulationStatus.COMPLETED
  );
}

/**
 * Get active vehicles (en route or servicing)
 */
export function getActiveVehicles(state: FleetSimulationState): SimulatedVehicle[] {
  return state.vehicles.filter(
    (v) =>
      v.status === VehicleSimulationStatus.EN_ROUTE ||
      v.status === VehicleSimulationStatus.SERVICING ||
      v.status === VehicleSimulationStatus.RETURNING
  );
}
