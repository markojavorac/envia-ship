/**
 * Fleet Metrics Calculator
 *
 * Utility functions for calculating performance metrics and statistics
 * for fleet optimization solutions.
 */

import type { FleetSolution, VehicleRoute } from "../fleet-types";
import { GUATEMALA_DELIVERY_CONSTANTS } from "../route-metrics";

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * Format time for display
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) {
    return `${mins}min`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * Format utilization percentage
 */
export function formatUtilization(percent: number): string {
  return `${Math.round(percent)}%`;
}

/**
 * Calculate estimated fuel cost for fleet solution
 */
export function calculateFuelCost(solution: FleetSolution): number {
  const { totalDistance } = solution;
  const { FUEL_CONSUMPTION_KM_PER_LITER, FUEL_PRICE_GTQ_PER_LITER } =
    GUATEMALA_DELIVERY_CONSTANTS;

  const litersUsed = totalDistance / FUEL_CONSUMPTION_KM_PER_LITER;
  const cost = litersUsed * FUEL_PRICE_GTQ_PER_LITER;

  return cost;
}

/**
 * Calculate estimated CO2 emissions
 */
export function calculateCO2Emissions(solution: FleetSolution): number {
  const { totalDistance } = solution;
  const { FUEL_CONSUMPTION_KM_PER_LITER, CO2_PER_LITER_KG } =
    GUATEMALA_DELIVERY_CONSTANTS;

  const litersUsed = totalDistance / FUEL_CONSUMPTION_KM_PER_LITER;
  const co2Kg = litersUsed * CO2_PER_LITER_KG;

  return co2Kg;
}

/**
 * Get utilization category for color coding
 */
export function getUtilizationCategory(
  percent: number
): "low" | "medium" | "high" | "optimal" {
  if (percent < 40) return "low";
  if (percent < 70) return "medium";
  if (percent < 90) return "high";
  return "optimal";
}

/**
 * Get color for utilization percentage
 */
export function getUtilizationColor(percent: number): string {
  const category = getUtilizationCategory(percent);

  switch (category) {
    case "low":
      return "text-destructive"; // Red - wasteful
    case "medium":
      return "text-yellow-600"; // Yellow - could be better
    case "high":
      return "text-blue-600"; // Blue - good
    case "optimal":
      return "text-green-600"; // Green - excellent
  }
}

/**
 * Calculate summary statistics for a fleet solution
 */
export interface FleetSummaryStats {
  totalDistance: string;
  totalTime: string;
  totalPackages: number;
  vehiclesUsed: number;
  vehiclesAvailable: number;
  avgUtilization: string;
  fuelCost: string;
  co2Emissions: string;
  optimizationTime: string;
}

export function calculateFleetSummary(
  solution: FleetSolution
): FleetSummaryStats {
  const fuelCost = calculateFuelCost(solution);
  const co2 = calculateCO2Emissions(solution);

  return {
    totalDistance: formatDistance(solution.totalDistance),
    totalTime: formatTime(solution.totalTime),
    totalPackages: solution.totalPackages,
    vehiclesUsed: solution.vehiclesUsed,
    vehiclesAvailable: solution.routes.length,
    avgUtilization: formatUtilization(solution.avgUtilization),
    fuelCost: `Q${fuelCost.toFixed(2)}`,
    co2Emissions: `${co2.toFixed(1)} kg CO₂`,
    optimizationTime: `${solution.optimizationTime}ms`,
  };
}

/**
 * Get statistics for individual vehicle routes
 */
export interface VehicleRouteStats {
  vehicleId: string;
  vehicleLabel: string;
  vehicleColor: string;
  stopCount: number;
  distance: string;
  time: string;
  packages: number;
  capacity: number;
  utilization: string;
  utilizationPercent: number;
  utilizationColor: string;
  isEmpty: boolean;
}

export function getVehicleRouteStats(route: VehicleRoute): VehicleRouteStats {
  return {
    vehicleId: route.vehicleId,
    vehicleLabel: route.vehicleLabel,
    vehicleColor: route.vehicleColor,
    stopCount: route.stops.length,
    distance: formatDistance(route.totalDistance),
    time: formatTime(route.totalTime),
    packages: route.packageCount,
    capacity: route.vehicleCapacity,
    utilization: formatUtilization(route.utilizationPercent),
    utilizationPercent: route.utilizationPercent,
    utilizationColor: getUtilizationColor(route.utilizationPercent),
    isEmpty: route.isEmpty,
  };
}

/**
 * Find the most/least utilized vehicle
 */
export function getUtilizationExtremes(solution: FleetSolution): {
  mostUtilized: VehicleRoute | null;
  leastUtilized: VehicleRoute | null;
} {
  const nonEmptyRoutes = solution.routes.filter((r) => !r.isEmpty);

  if (nonEmptyRoutes.length === 0) {
    return { mostUtilized: null, leastUtilized: null };
  }

  const mostUtilized = nonEmptyRoutes.reduce((max, r) =>
    r.utilizationPercent > max.utilizationPercent ? r : max
  );

  const leastUtilized = nonEmptyRoutes.reduce((min, r) =>
    r.utilizationPercent < min.utilizationPercent ? r : min
  );

  return { mostUtilized, leastUtilized };
}

/**
 * Calculate balance score (how evenly distributed packages are)
 * Returns 0-100, where 100 is perfectly balanced
 */
export function calculateBalanceScore(solution: FleetSolution): number {
  const nonEmptyRoutes = solution.routes.filter((r) => !r.isEmpty);

  if (nonEmptyRoutes.length <= 1) {
    return 100; // Single vehicle is perfectly balanced
  }

  const utilizationValues = nonEmptyRoutes.map((r) => r.utilizationPercent);
  const avgUtilization =
    utilizationValues.reduce((sum, u) => sum + u, 0) / utilizationValues.length;

  // Calculate standard deviation
  const variance =
    utilizationValues.reduce((sum, u) => sum + Math.pow(u - avgUtilization, 2), 0) /
    utilizationValues.length;
  const stdDev = Math.sqrt(variance);

  // Convert to 0-100 score (lower stdDev = higher score)
  // Assume stdDev of 30% is "very unbalanced" → score 0
  const score = Math.max(0, 100 - (stdDev / 30) * 100);

  return score;
}
