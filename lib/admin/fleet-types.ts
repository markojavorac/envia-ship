/**
 * Fleet Optimization - Type Definitions
 *
 * Types for multi-vehicle fleet optimization with capacity constraints.
 * Part of the graph-based VRP (Vehicle Routing Problem) system.
 */

import type { RouteStop, Coordinates } from "./route-types";
import type { DeliveryGraph } from "./fleet-graph-types";
import type { OSRMRouteGeometry } from "./osrm-route-client";

/**
 * Vehicle type definition (template for creating vehicles)
 */
export interface VehicleType {
  /** Unique identifier for vehicle type */
  id: string;
  /** Display name (e.g., "Motorcycle", "Van", "Truck") */
  name: string;
  /** Maximum number of packages this vehicle type can carry */
  packageCapacity: number;
  /** Color for visualization (hex code) */
  color: string;
  /** Optional icon identifier */
  icon?: string;
}

/**
 * Individual vehicle instance in the fleet
 */
export interface Vehicle {
  /** Unique identifier for this vehicle */
  id: string;
  /** Reference to vehicle type */
  vehicleTypeId: string;
  /** Display label (e.g., "Vehicle 1", "Truck A") */
  label: string;
  /** Package capacity (copied from type for convenience) */
  packageCapacity: number;
  /** Color for visualization (copied from type) */
  color: string;
  /** Current package count (for tracking utilization) */
  currentPackageCount?: number;
}

/**
 * Fleet configuration for optimization
 */
export interface FleetConfig {
  /** List of available vehicles */
  vehicles: Vehicle[];
  /** Starting point for all vehicles (depot/warehouse) */
  depot: RouteStop;
  /** Whether vehicles should return to depot after completing route */
  returnToDepot: boolean;
  /** Optional callback for progress updates during optimization */
  onProgress?: (progress: FleetOptimizationProgress) => void;
}

/**
 * Single vehicle's route in the optimized solution
 */
export interface VehicleRoute {
  /** Reference to vehicle ID */
  vehicleId: string;
  /** Vehicle display label */
  vehicleLabel: string;
  /** Vehicle color for visualization */
  vehicleColor: string;
  /** Ordered stops for this vehicle (including depot if returnToDepot=true) */
  stops: RouteStop[];
  /** Total distance in kilometers */
  totalDistance: number;
  /** Estimated total time in minutes */
  totalTime: number;
  /** Total number of packages assigned to this route */
  packageCount: number;
  /** Vehicle capacity */
  vehicleCapacity: number;
  /** Utilization percentage (packageCount / vehicleCapacity * 100) */
  utilizationPercent: number;
  /** Whether this route is empty (no stops assigned) */
  isEmpty: boolean;
  /** OSRM route geometry for map visualization (null if OSRM failed) */
  geometry?: OSRMRouteGeometry | null;
  /** Time window violations (if any) */
  timeWindowViolations?: TimeWindowViolation[];
}

/**
 * Time window violation record
 */
export interface TimeWindowViolation {
  /** Stop ID where violation occurred */
  stopId: string;
  /** Actual arrival time */
  arrivalTime: Date;
  /** Window start time */
  windowStart: Date;
  /** Window end time */
  windowEnd: Date;
  /** Type of violation */
  violationType: "early" | "late";
  /** Severity of violation */
  severity: "hard" | "soft";
  /** Delay in minutes (negative if early) */
  delayMinutes: number;
}

/**
 * Complete multi-vehicle fleet optimization solution
 */
export interface FleetSolution {
  /** Individual routes for each vehicle */
  routes: VehicleRoute[];
  /** Total distance across all vehicles (km) */
  totalDistance: number;
  /** Total time (longest route duration in minutes) */
  totalTime: number;
  /** Total number of packages across all routes */
  totalPackages: number;
  /** Stops that couldn't be assigned (capacity exceeded) */
  unassignedStops: RouteStop[];
  /** Time taken to compute optimization (milliseconds) */
  optimizationTime: number;
  /** Algorithm used for optimization */
  algorithm: "clarke-wright" | "sweep" | "greedy";
  /** Graph representation for visualization */
  graph: DeliveryGraph;
  /** Timestamp when optimization was performed */
  optimizedAt: Date;
  /** Average vehicle utilization percentage */
  avgUtilization: number;
  /** Number of vehicles actually used (non-empty routes) */
  vehiclesUsed: number;
}

/**
 * Progress tracking for fleet optimization
 */
export interface FleetOptimizationProgress {
  /** Current optimization phase */
  phase: "distance_matrix" | "calculating_savings" | "merging_routes" | "validating" | "finalizing";
  /** Current step number */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Human-readable message */
  message: string;
  /** Completion percentage (0-100) */
  percent: number;
}

/**
 * Savings calculation result for Clarke-Wright algorithm
 * Represents the savings from merging two routes
 */
export interface SavingsPair {
  /** First stop ID */
  stopI: string;
  /** Second stop ID */
  stopJ: string;
  /** Savings value: d(depot,i) + d(depot,j) - d(i,j) */
  saving: number;
  /** Index of stop i in stops array */
  indexI: number;
  /** Index of stop j in stops array */
  indexJ: number;
}

/**
 * Internal route representation during Clarke-Wright optimization
 */
export interface InternalRoute {
  /** Unique ID for this route during optimization */
  id: string;
  /** Vehicle assigned to this route */
  vehicleId: string;
  /** Stops in route (ordered) */
  stops: RouteStop[];
  /** Current package count */
  packageCount: number;
  /** Vehicle capacity */
  capacity: number;
  /** Total distance so far */
  distance: number;
  /** Whether this route is still active (not merged) */
  active: boolean;
}
