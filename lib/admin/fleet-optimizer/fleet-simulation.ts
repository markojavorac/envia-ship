/**
 * Fleet Simulation Engine
 *
 * Core simulation logic for real-time fleet tracking and route progression.
 * Reuses patterns from driver-tracking/simulation.ts
 */

import * as turf from "@turf/turf";
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
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Interpolate position along OSRM geometry coordinates based on progress (0-1)
 * This makes vehicles follow actual roads instead of straight lines
 */
export function interpolatePositionAlongGeometry(
  geometryCoordinates: [number, number][],
  progress: number
): Coordinates {
  if (!geometryCoordinates || geometryCoordinates.length === 0) {
    throw new Error("Geometry coordinates array is empty");
  }

  if (geometryCoordinates.length === 1) {
    return { lng: geometryCoordinates[0][0], lat: geometryCoordinates[0][1] };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Calculate cumulative distances along the geometry path
  const distances: number[] = [0];
  let totalDistance = 0;

  for (let i = 1; i < geometryCoordinates.length; i++) {
    const prev = { lng: geometryCoordinates[i - 1][0], lat: geometryCoordinates[i - 1][1] };
    const curr = { lng: geometryCoordinates[i][0], lat: geometryCoordinates[i][1] };
    const segmentDistance = calculateDistance(prev, curr);
    totalDistance += segmentDistance;
    distances.push(totalDistance);
  }

  if (totalDistance === 0) {
    return { lng: geometryCoordinates[0][0], lat: geometryCoordinates[0][1] };
  }

  // Find the target distance based on progress
  const targetDistance = clampedProgress * totalDistance;

  // Find the segment containing the target distance
  let segmentIndex = 0;
  for (let i = 1; i < distances.length; i++) {
    if (targetDistance <= distances[i]) {
      segmentIndex = i - 1;
      break;
    }
  }

  // Handle edge case: progress = 1.0 (end of route)
  if (segmentIndex >= geometryCoordinates.length - 1) {
    const lastIdx = geometryCoordinates.length - 1;
    return { lng: geometryCoordinates[lastIdx][0], lat: geometryCoordinates[lastIdx][1] };
  }

  // Calculate progress within the segment
  const segmentStart = distances[segmentIndex];
  const segmentEnd = distances[segmentIndex + 1];
  const segmentLength = segmentEnd - segmentStart;
  const segmentProgress = segmentLength > 0 ? (targetDistance - segmentStart) / segmentLength : 0;

  // Interpolate between the two geometry points
  const start = {
    lng: geometryCoordinates[segmentIndex][0],
    lat: geometryCoordinates[segmentIndex][1],
  };
  const end = {
    lng: geometryCoordinates[segmentIndex + 1][0],
    lat: geometryCoordinates[segmentIndex + 1][1],
  };

  return {
    lat: start.lat + (end.lat - start.lat) * segmentProgress,
    lng: start.lng + (end.lng - start.lng) * segmentProgress,
  };
}

/**
 * Extract geometry slice for a specific segment of the route using Turf.js
 * This properly slices the full route geometry to get just the portion between two stops
 * Returns null if geometry is not available
 */
function extractSegmentGeometry(
  route: any,
  fromStopIndex: number,
  toStopIndex: number,
  fromCoordinates: Coordinates,
  toCoordinates: Coordinates
): [number, number][] | null {
  if (
    !route ||
    !route.geometry ||
    !route.geometry.coordinates ||
    route.geometry.coordinates.length === 0
  ) {
    console.log("[Geometry] No route geometry available, will use linear interpolation");
    return null;
  }

  try {
    // Convert full route geometry to Turf LineString
    const fullLine = turf.lineString(route.geometry.coordinates);

    // Convert stop coordinates to Turf Points
    const startPoint = turf.point([fromCoordinates.lng, fromCoordinates.lat]);
    const endPoint = turf.point([toCoordinates.lng, toCoordinates.lat]);

    // Find nearest points on the line to the start and end stops
    const startSnap = turf.nearestPointOnLine(fullLine, startPoint);
    const endSnap = turf.nearestPointOnLine(fullLine, endPoint);

    // Get the distance along the line for start and end points
    const startDistance = startSnap.properties.location;
    const endDistance = endSnap.properties.location;

    // Slice the line between these two points
    const startPointOnLine = turf.along(fullLine, startDistance);
    const endPointOnLine = turf.along(fullLine, endDistance);

    const segmentLine = turf.lineSlice(startPointOnLine, endPointOnLine, fullLine);

    if (!segmentLine || !segmentLine.geometry || !segmentLine.geometry.coordinates) {
      console.warn("[Geometry] Failed to slice geometry, falling back to linear");
      return null;
    }

    const coordinates = segmentLine.geometry.coordinates as [number, number][];

    console.log(
      `[Geometry] ✅ Extracted segment from index ${fromStopIndex} to ${toStopIndex}: ${coordinates.length} points`
    );

    return coordinates;
  } catch (error) {
    console.error("[Geometry] Error extracting segment geometry:", error);
    return null;
  }
}

/**
 * Calculate position using geometry if available, fallback to linear interpolation
 */
function calculatePositionAlongRoute(
  route: any,
  fromStopIndex: number,
  toStopIndex: number,
  fromCoordinates: Coordinates,
  toCoordinates: Coordinates,
  progress: number
): Coordinates {
  const geometry = extractSegmentGeometry(
    route,
    fromStopIndex,
    toStopIndex,
    fromCoordinates,
    toCoordinates
  );

  if (geometry && geometry.length > 2) {
    // Use geometry-aware interpolation for realistic road following
    try {
      const position = interpolatePositionAlongGeometry(geometry, progress);
      // Log occasionally for debugging (every 20% progress)
      if (progress % 0.2 < 0.05) {
        console.log(
          `[Position] Vehicle at ${(progress * 100).toFixed(0)}% along segment ${fromStopIndex}→${toStopIndex}`
        );
      }
      return position;
    } catch (error) {
      console.warn(
        "[Position] Failed to interpolate along geometry, falling back to linear:",
        error
      );
      return interpolatePosition(fromCoordinates, toCoordinates, progress);
    }
  }

  // Fallback to simple linear interpolation if no geometry
  console.log(`[Position] Using linear interpolation for segment ${fromStopIndex}→${toStopIndex}`);
  return interpolatePosition(fromCoordinates, toCoordinates, progress);
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

  // WAITING state - arrived early, waiting for time window to open
  if (vehicle.status === VehicleSimulationStatus.WAITING) {
    const route = vehicle.assignedRoute;
    if (!route) return vehicle;

    const currentStop = route.stops[vehicle.currentStopIndex];
    if (!currentStop || !currentStop.timeWindow) {
      // No time window, start servicing immediately
      return {
        ...vehicle,
        status: VehicleSimulationStatus.SERVICING,
        serviceStartTime: Date.now(),
      };
    }

    // Check if time window has opened
    const currentTime = new Date(Date.now());
    if (currentTime >= currentStop.timeWindow.earliest) {
      // Window opened, start servicing
      return {
        ...vehicle,
        status: VehicleSimulationStatus.SERVICING,
        serviceStartTime: Date.now(),
      };
    }

    // Still waiting
    return vehicle;
  }

  // SERVICING state - wait for service duration
  if (vehicle.status === VehicleSimulationStatus.SERVICING) {
    const route = vehicle.assignedRoute;
    const currentStop = route?.stops[vehicle.currentStopIndex];

    // Use stop-specific service time if available, otherwise fall back to config default
    const serviceTime = currentStop?.serviceTime
      ? currentStop.serviceTime * 60 * 1000 // Convert minutes to milliseconds
      : config.serviceDuration;

    const elapsed = Date.now() - (vehicle.serviceStartTime ?? 0);

    if (elapsed >= serviceTime) {
      // Service complete, move to next stop
      const nextStopIndex = vehicle.currentStopIndex + 1;
      const hasMoreStops =
        vehicle.assignedRoute && nextStopIndex < vehicle.assignedRoute.stops.length;

      return {
        ...vehicle,
        status: hasMoreStops ? VehicleSimulationStatus.EN_ROUTE : VehicleSimulationStatus.RETURNING,
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

    // Update position toward depot using geometry if available
    const position = calculatePositionAlongRoute(
      route,
      route.stops.length - 1,
      -1, // Depot (special case)
      lastStop.coordinates,
      depotPosition,
      newProgress
    );

    return {
      ...vehicle,
      currentSegmentProgress: newProgress,
      position,
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
    // Arrived at target stop
    // Check time window
    const currentTime = new Date(Date.now());

    if (targetStop.timeWindow) {
      if (currentTime < targetStop.timeWindow.earliest) {
        // Arrived early - enter WAITING state
        return {
          ...vehicle,
          status: VehicleSimulationStatus.WAITING,
          position: targetStop.coordinates,
          currentSegmentProgress: 0,
          serviceStartTime: null,
          estimatedArrival: null,
        };
      }
      // Within window or late - start servicing
    }

    // No time window or within window - start servicing
    return {
      ...vehicle,
      status: VehicleSimulationStatus.SERVICING,
      position: targetStop.coordinates,
      currentSegmentProgress: 0,
      serviceStartTime: Date.now(),
      estimatedArrival: null,
    };
  }

  // Update position along segment using geometry if available
  const position = calculatePositionAlongRoute(
    route,
    targetStopIndex - 1,
    targetStopIndex,
    startPosition,
    targetStop.coordinates,
    newProgress
  );

  return {
    ...vehicle,
    currentSegmentProgress: newProgress,
    position,
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
    (v) =>
      v.status === VehicleSimulationStatus.IDLE || v.status === VehicleSimulationStatus.COMPLETED
  );

  return state.ticketQueue.length >= state.autoReoptimizeThreshold && availableVehicles.length > 0;
}

/**
 * Get available vehicles for reoptimization
 */
export function getAvailableVehicles(state: FleetSimulationState): SimulatedVehicle[] {
  return state.vehicles.filter(
    (v) =>
      v.status === VehicleSimulationStatus.IDLE || v.status === VehicleSimulationStatus.COMPLETED
  );
}

/**
 * Get active vehicles (en route, waiting, servicing, or returning)
 */
export function getActiveVehicles(state: FleetSimulationState): SimulatedVehicle[] {
  return state.vehicles.filter(
    (v) =>
      v.status === VehicleSimulationStatus.EN_ROUTE ||
      v.status === VehicleSimulationStatus.WAITING ||
      v.status === VehicleSimulationStatus.SERVICING ||
      v.status === VehicleSimulationStatus.RETURNING
  );
}
