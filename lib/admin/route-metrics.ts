/**
 * Route Business Metrics - Fuel Cost & CO2 Calculations
 *
 * Utilities for calculating business value of route optimization.
 * Used to demonstrate cost savings and environmental impact to stakeholders.
 */

import type { OptimizedRoute } from "./route-types";

/**
 * Guatemala-specific constants for delivery operations
 */
export const GUATEMALA_DELIVERY_CONSTANTS = {
  // Average fuel consumption for delivery vehicles in Guatemala
  FUEL_CONSUMPTION_KM_PER_LITER: 10, // km per liter (typical for small delivery trucks/vans)

  // Current fuel price in Guatemala (Quetzales per liter)
  // Average as of Dec 2024: ~30 GTQ/gallon = ~7.9 GTQ/liter
  FUEL_PRICE_GTQ_PER_LITER: 7.9,

  // CO2 emissions per liter of gasoline (industry standard)
  CO2_PER_LITER_KG: 2.3, // kg of CO2 per liter burned

  // Average delivery speed in Guatemala City (km/h)
  AVG_SPEED_KMH: 30, // Conservative estimate accounting for traffic
} as const;

/**
 * Calculate fuel cost for a given distance
 *
 * @param distanceKm - Distance in kilometers
 * @returns Fuel cost in Quetzales (GTQ)
 */
export function calculateFuelCost(distanceKm: number): number {
  const { FUEL_CONSUMPTION_KM_PER_LITER, FUEL_PRICE_GTQ_PER_LITER } = GUATEMALA_DELIVERY_CONSTANTS;

  const litersUsed = distanceKm / FUEL_CONSUMPTION_KM_PER_LITER;
  const cost = litersUsed * FUEL_PRICE_GTQ_PER_LITER;

  return Math.round(cost * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate CO2 emissions for a given distance
 *
 * @param distanceKm - Distance in kilometers
 * @returns CO2 emissions in kilograms
 */
export function calculateCO2(distanceKm: number): number {
  const { FUEL_CONSUMPTION_KM_PER_LITER, CO2_PER_LITER_KG } = GUATEMALA_DELIVERY_CONSTANTS;

  const litersUsed = distanceKm / FUEL_CONSUMPTION_KM_PER_LITER;
  const co2Kg = litersUsed * CO2_PER_LITER_KG;

  return Math.round(co2Kg * 100) / 100; // Round to 2 decimal places
}

/**
 * Business metrics for route optimization
 */
export interface RouteBusinessMetrics {
  // Distance metrics
  originalDistance: number; // km
  optimizedDistance: number; // km
  distanceSaved: number; // km
  distanceSavedPercent: number; // %

  // Time metrics
  originalTime: number; // minutes
  optimizedTime: number; // minutes
  timeSaved: number; // minutes
  timeSavedPercent: number; // %

  // Cost metrics
  originalFuelCost: number; // GTQ
  optimizedFuelCost: number; // GTQ
  fuelCostSaved: number; // GTQ per route
  fuelCostSavedMonthly: number; // GTQ per month (assuming 250 routes/month)

  // Environmental metrics
  originalCO2: number; // kg
  optimizedCO2: number; // kg
  co2Saved: number; // kg per route
  co2SavedMonthly: number; // kg per month

  // Summary
  improvementPercent: number; // Overall improvement %
  totalStops: number;
}

/**
 * Calculate comprehensive business metrics from an optimized route
 *
 * @param route - Optimized route with before/after comparison
 * @param monthlyRouteCount - Number of similar routes per month (default: 250)
 * @returns Complete business metrics for presentation
 */
export function calculateBusinessMetrics(
  route: OptimizedRoute,
  monthlyRouteCount: number = 250
): RouteBusinessMetrics {
  // Extract route data
  const {
    originalDistance,
    totalDistance: optimizedDistance,
    originalTime,
    totalTime: optimizedTime,
    distanceSaved,
    timeSaved,
    improvementPercent,
    optimizedStops,
  } = route;

  // Calculate fuel costs
  const originalFuelCost = calculateFuelCost(originalDistance);
  const optimizedFuelCost = calculateFuelCost(optimizedDistance);
  const fuelCostSaved = originalFuelCost - optimizedFuelCost;
  const fuelCostSavedMonthly = fuelCostSaved * monthlyRouteCount;

  // Calculate CO2 emissions
  const originalCO2 = calculateCO2(originalDistance);
  const optimizedCO2 = calculateCO2(optimizedDistance);
  const co2Saved = originalCO2 - optimizedCO2;
  const co2SavedMonthly = co2Saved * monthlyRouteCount;

  // Calculate time percentages
  const timeSavedPercent = originalTime > 0 ? (timeSaved / originalTime) * 100 : 0;

  // Calculate distance percentages (already in route, but recalculate for consistency)
  const distanceSavedPercent = originalDistance > 0 ? (distanceSaved / originalDistance) * 100 : 0;

  return {
    // Distance
    originalDistance: Math.round(originalDistance * 10) / 10,
    optimizedDistance: Math.round(optimizedDistance * 10) / 10,
    distanceSaved: Math.round(distanceSaved * 10) / 10,
    distanceSavedPercent: Math.round(distanceSavedPercent * 10) / 10,

    // Time
    originalTime,
    optimizedTime,
    timeSaved,
    timeSavedPercent: Math.round(timeSavedPercent * 10) / 10,

    // Fuel cost
    originalFuelCost,
    optimizedFuelCost,
    fuelCostSaved,
    fuelCostSavedMonthly: Math.round(fuelCostSavedMonthly * 100) / 100,

    // CO2
    originalCO2,
    optimizedCO2,
    co2Saved,
    co2SavedMonthly: Math.round(co2SavedMonthly * 100) / 100,

    // Summary
    improvementPercent: Math.round(improvementPercent * 10) / 10,
    totalStops: optimizedStops.length,
  };
}

/**
 * Format currency for display (Quetzales)
 *
 * @param amount - Amount in GTQ
 * @returns Formatted string (e.g., "Q15.75")
 */
export function formatCurrency(amount: number): string {
  return `Q${amount.toFixed(2)}`;
}

/**
 * Format weight for display (kilograms)
 *
 * @param kg - Weight in kilograms
 * @returns Formatted string (e.g., "2.3 kg")
 */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(2)} kg`;
}

/**
 * Format percentage for display
 *
 * @param percent - Percentage value
 * @returns Formatted string (e.g., "25%")
 */
export function formatPercent(percent: number): string {
  return `${Math.round(percent)}%`;
}

/**
 * Format distance for display
 *
 * @param km - Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km")
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * Format duration for display
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "1h 25m" or "35m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Generate executive summary text for CEO presentation
 *
 * @param metrics - Route business metrics
 * @returns Human-readable summary emphasizing business value
 */
export function generateExecutiveSummary(metrics: RouteBusinessMetrics): string {
  const { fuelCostSaved, fuelCostSavedMonthly, improvementPercent, timeSaved } = metrics;

  return `Route optimization saves ${formatCurrency(fuelCostSaved)} per delivery (${formatPercent(improvementPercent)} improvement), reducing delivery time by ${timeSaved} minutes. At 250 routes per month, this translates to ${formatCurrency(fuelCostSavedMonthly)} in monthly fuel savings.`;
}
