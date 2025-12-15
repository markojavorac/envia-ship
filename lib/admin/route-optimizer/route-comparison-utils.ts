/**
 * Route Comparison Utilities
 *
 * Calculate metrics for before/after route comparison
 */

import type { OptimizedRoute } from "../route-types";

export interface RouteComparison {
  // Before (Original)
  originalDistance: number; // km
  originalTime: number; // minutes
  originalFuelCost: number; // GTQ
  originalCo2: number; // kg

  // After (Optimized)
  optimizedDistance: number; // km
  optimizedTime: number; // minutes
  optimizedFuelCost: number; // GTQ
  optimizedCo2: number; // kg

  // Savings
  distanceSaved: number; // km
  timeSaved: number; // minutes
  fuelCostSaved: number; // GTQ
  co2Saved: number; // kg
  improvementPercent: number; // %

  // Monthly projections (assuming 250 routes/month)
  monthlyFuelSavings: number; // GTQ
  monthlyCo2Reduction: number; // kg
  monthlyDistanceSaved: number; // km
}

/**
 * Constants for calculations
 */
const FUEL_CONSUMPTION = 10; // km per liter (typical delivery vehicle)
const FUEL_PRICE_PER_LITER = 7.9; // GTQ (December 2024 Guatemala average)
const CO2_PER_LITER = 2.3; // kg CO2 per liter of gasoline
const ROUTES_PER_MONTH = 250; // Assumption for monthly projections

/**
 * Calculate fuel cost from distance
 */
function calculateFuelCost(distanceKm: number): number {
  const liters = distanceKm / FUEL_CONSUMPTION;
  return liters * FUEL_PRICE_PER_LITER;
}

/**
 * Calculate CO2 emissions from distance
 */
function calculateCo2(distanceKm: number): number {
  const liters = distanceKm / FUEL_CONSUMPTION;
  return liters * CO2_PER_LITER;
}

/**
 * Create route comparison from OptimizedRoute data
 */
export function createRouteComparison(optimizedRoute: OptimizedRoute): RouteComparison {
  const {
    originalDistance,
    originalTime,
    totalDistance: optimizedDistance,
    totalTime: optimizedTime,
    distanceSaved,
    timeSaved,
    improvementPercent,
  } = optimizedRoute;

  // Calculate costs
  const originalFuelCost = calculateFuelCost(originalDistance);
  const optimizedFuelCost = calculateFuelCost(optimizedDistance);
  const fuelCostSaved = originalFuelCost - optimizedFuelCost;

  // Calculate CO2
  const originalCo2 = calculateCo2(originalDistance);
  const optimizedCo2 = calculateCo2(optimizedDistance);
  const co2Saved = originalCo2 - optimizedCo2;

  // Monthly projections
  const monthlyFuelSavings = fuelCostSaved * ROUTES_PER_MONTH;
  const monthlyCo2Reduction = co2Saved * ROUTES_PER_MONTH;
  const monthlyDistanceSaved = distanceSaved * ROUTES_PER_MONTH;

  return {
    // Before
    originalDistance,
    originalTime,
    originalFuelCost,
    originalCo2,

    // After
    optimizedDistance,
    optimizedTime,
    optimizedFuelCost,
    optimizedCo2,

    // Savings
    distanceSaved,
    timeSaved,
    fuelCostSaved,
    co2Saved,
    improvementPercent,

    // Monthly
    monthlyFuelSavings,
    monthlyCo2Reduction,
    monthlyDistanceSaved,
  };
}

/**
 * Format distance with unit
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * Format time with unit
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

/**
 * Format currency (GTQ)
 */
export function formatCurrency(amount: number): string {
  return `Q${Math.round(amount).toLocaleString()}`;
}

/**
 * Format weight (kg)
 */
export function formatWeight(kg: number): string {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} g`;
  }
  return `${kg.toFixed(1)} kg`;
}

/**
 * Format percent
 */
export function formatPercent(percent: number): string {
  return `${Math.round(percent)}%`;
}
