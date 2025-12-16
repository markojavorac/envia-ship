/**
 * Fleet Optimizer Simulation Types
 *
 * Type definitions for real-time fleet simulation state and configuration.
 */

import type { Coordinates, RouteStop } from "../route-types";
import type { Vehicle, VehicleRoute } from "../fleet-types";

/**
 * Vehicle simulation status
 */
export enum VehicleSimulationStatus {
  IDLE = "idle", // At depot, available for new routes
  EN_ROUTE = "en_route", // Moving between stops
  SERVICING = "servicing", // At stop, unloading packages
  RETURNING = "returning", // Returning to depot after last stop
  COMPLETED = "completed", // Route finished, at depot
}

/**
 * Extended vehicle with simulation state
 */
export interface SimulatedVehicle extends Vehicle {
  status: VehicleSimulationStatus;
  assignedRoute: VehicleRoute | null;
  currentStopIndex: number;
  position: Coordinates;
  currentSegmentProgress: number; // 0-1 along current segment
  serviceStartTime: number | null; // Timestamp when service started
  estimatedArrival: Date | null; // ETA for next stop
  completedStops: number;
  remainingStops: number;
}

/**
 * Queued delivery ticket waiting for assignment
 */
export interface QueuedTicket {
  id: string;
  stop: RouteStop;
  addedAt: Date;
  priority: "normal" | "urgent";
}

/**
 * Complete simulation state
 */
export interface FleetSimulationState {
  vehicles: SimulatedVehicle[];
  ticketQueue: QueuedTicket[];
  isRunning: boolean;
  simulationSpeed: number; // 1x, 2x, 5x, 10x
  currentTime: Date;
  ticketGenerationEnabled: boolean;
  autoReoptimizeThreshold: number; // Trigger reoptimization when queue reaches this size
}

/**
 * Simulation configuration
 */
export interface SimulationConfig {
  segmentDuration: number; // ms per segment (default: 30000 = 30s)
  serviceDuration: number; // ms per stop (default: 10000 = 10s)
  ticketGenerationMin: number; // min interval in ms (default: 10000 = 10s)
  ticketGenerationMax: number; // max interval in ms (default: 30000 = 30s)
  reoptimizeThreshold: number; // queue size trigger (default: 5)
}

/**
 * Default simulation configuration
 */
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  segmentDuration: 30000, // 30 seconds per segment
  serviceDuration: 10000, // 10 seconds per stop
  ticketGenerationMin: 10000, // 10 seconds minimum
  ticketGenerationMax: 30000, // 30 seconds maximum
  reoptimizeThreshold: 5, // Reoptimize when 5 tickets in queue
};
