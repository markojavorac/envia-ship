/**
 * Route Planner - Utility Functions
 *
 * Optimization algorithms, distance calculations, and helper functions.
 */

import {
  Coordinates,
  RouteStop,
  RouteConfig,
  OptimizedRoute,
  OptimizationMode,
  RoutingMode,
} from "./route-types";
import { getOSRMDistance, convertOSRMResponse } from "./osrm-client";
import { getCachedDistance, cacheDistance } from "./distance-cache";

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate straight-line distance between two coordinates using Haversine formula
 *
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Build a distance matrix for all stops
 *
 * @param stops Array of route stops
 * @returns 2D array where matrix[i][j] is distance from stop i to stop j
 */
export function buildDistanceMatrix(stops: RouteStop[]): number[][] {
  const n = stops.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = haversineDistance(stops[i].coordinates, stops[j].coordinates);
      }
    }
  }

  return matrix;
}

/**
 * Calculate total distance for a route visiting stops in given order
 *
 * @param stops Array of stops in order to visit
 * @returns Total distance in kilometers
 */
export function calculateTotalDistance(stops: RouteStop[]): number {
  if (stops.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += haversineDistance(stops[i].coordinates, stops[i + 1].coordinates);
  }

  return total;
}

/**
 * Estimate travel time based on distance
 * Assumes average speed of 30 km/h in Guatemala City (accounting for traffic, stops)
 *
 * @param distanceKm Distance in kilometers
 * @returns Estimated time in minutes
 */
export function estimateTravelTime(distanceKm: number): number {
  const avgSpeedKmh = 30; // Conservative average for urban delivery
  const hours = distanceKm / avgSpeedKmh;
  return Math.round(hours * 60);
}

/**
 * Format distance for display
 *
 * @param km Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km")
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * Format duration for display
 *
 * @param minutes Duration in minutes
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
 * Get distance and duration between two coordinates
 *
 * Uses OSRM for road-based routing (if enabled), falls back to Haversine
 * Results are cached to avoid duplicate API calls
 *
 * @param coord1 Starting coordinates
 * @param coord2 Ending coordinates
 * @param useRoadRouting If true, use OSRM API; if false, use Haversine
 * @returns Distance in km and duration in minutes
 */
export async function getDistanceBetweenStops(
  coord1: Coordinates,
  coord2: Coordinates,
  useRoadRouting: boolean = true
): Promise<{ distance: number; duration: number }> {
  // Check cache first
  const cached = getCachedDistance(coord1, coord2);
  if (cached) {
    return {
      distance: cached.distance,
      duration: cached.duration,
    };
  }

  let distance: number;
  let duration: number;

  // Try OSRM if road routing is enabled
  if (useRoadRouting) {
    try {
      const osrmResult = await getOSRMDistance(coord1, coord2);
      if (osrmResult) {
        const converted = convertOSRMResponse(osrmResult);
        distance = converted.distance;
        duration = converted.duration;

        // Cache the result
        cacheDistance(coord1, coord2, distance, duration);

        return { distance, duration };
      }
    } catch (error) {
      console.warn("OSRM request failed, falling back to Haversine:", error);
    }
  }

  // Fallback to Haversine
  distance = haversineDistance(coord1, coord2);
  duration = estimateTravelTime(distance);

  // Cache the fallback result
  cacheDistance(coord1, coord2, distance, duration);

  return { distance, duration };
}

/**
 * Calculate total distance for a route (async version with optional road routing)
 */
async function calculateTotalDistanceAsync(
  stops: RouteStop[],
  useRoadRouting: boolean = true
): Promise<{ distance: number; duration: number }> {
  if (stops.length < 2) {
    return { distance: 0, duration: 0 };
  }

  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const result = await getDistanceBetweenStops(
      stops[i].coordinates,
      stops[i + 1].coordinates,
      useRoadRouting
    );
    totalDistance += result.distance;
    totalDuration += result.duration;
  }

  return {
    distance: totalDistance,
    duration: totalDuration,
  };
}

/**
 * Optimize route using Nearest Neighbor algorithm (async with road routing support)
 *
 * Algorithm:
 * 1. Start at the starting point (or first stop if none specified)
 * 2. Find the nearest unvisited stop (using road distances if enabled)
 * 3. Move to that stop and mark as visited
 * 4. Repeat until all stops visited
 * 5. Return to start point if round trip enabled
 *
 * Time Complexity: O(n²) + network requests if using OSRM
 * Performance: ~2-5 seconds for 25 stops with OSRM, < 100ms with Haversine
 * Optimality: Typically 10-25% longer than optimal, but fast and simple
 *
 * @param stops Array of stops to visit
 * @param config Route configuration
 * @returns Optimized route with comparison metrics
 */
export async function optimizeRouteNearestNeighbor(
  stops: RouteStop[],
  config: RouteConfig
): Promise<OptimizedRoute> {
  if (stops.length === 0) {
    throw new Error("Cannot optimize route with no stops");
  }

  // Determine routing mode
  const useRoadRouting =
    config.routingMode === RoutingMode.ROAD || config.routingMode === undefined; // Default to road routing

  if (stops.length === 1) {
    // Single stop - no optimization needed
    return {
      routeId: `route-${Date.now()}`,
      optimizedStops: stops.map((stop, i) => ({
        ...stop,
        sequenceNumber: i + 1,
      })),
      totalDistance: 0,
      totalTime: 0,
      distanceMatrix: [[0]],
      optimizationMode: OptimizationMode.NEAREST_NEIGHBOR,
      routingMode: useRoadRouting ? RoutingMode.ROAD : RoutingMode.STRAIGHT_LINE,
      optimizedAt: new Date(),
      originalDistance: 0,
      originalTime: 0,
      distanceSaved: 0,
      timeSaved: 0,
      improvementPercent: 0,
    };
  }

  // Create copy of stops to avoid mutation
  let unvisited = [...stops];
  const ordered: RouteStop[] = [];

  // Determine starting point
  let current: RouteStop;
  if (config.startPoint) {
    current = config.startPoint;
    // Remove start point from unvisited if it's in the stops list
    unvisited = unvisited.filter((s) => s.id !== current.id);
  } else {
    // Use first stop as starting point
    current = unvisited[0];
    unvisited = unvisited.slice(1);
  }

  // Nearest Neighbor greedy algorithm (async)
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    // Find nearest unvisited stop (async distance calculation)
    for (let i = 0; i < unvisited.length; i++) {
      const result = await getDistanceBetweenStops(
        current.coordinates,
        unvisited[i].coordinates,
        useRoadRouting
      );
      if (result.distance < nearestDistance) {
        nearestDistance = result.distance;
        nearestIndex = i;
      }
    }

    // Move to nearest stop
    current = unvisited[nearestIndex];
    ordered.push(current);
    unvisited.splice(nearestIndex, 1);
  }

  // Build complete route with start/end points
  const completeOptimizedRoute: RouteStop[] = [];
  if (config.startPoint) {
    completeOptimizedRoute.push(config.startPoint);
  }
  completeOptimizedRoute.push(...ordered);

  // Handle end point
  if (config.isRoundTrip && config.startPoint) {
    // Round trip - return to start
    completeOptimizedRoute.push(config.startPoint);
  } else if (config.endPoint && !config.isRoundTrip) {
    // Specific end point
    completeOptimizedRoute.push(config.endPoint);
  }

  // Calculate optimized route metrics (async)
  const optimizedMetrics = await calculateTotalDistanceAsync(
    completeOptimizedRoute,
    useRoadRouting
  );
  const totalDistance = optimizedMetrics.distance;
  const totalTime = optimizedMetrics.duration;

  // Calculate original route metrics (visiting in entered order)
  const originalOrder: RouteStop[] = [];
  if (config.startPoint) {
    originalOrder.push(config.startPoint);
  }
  originalOrder.push(...stops);
  if (config.isRoundTrip && config.startPoint) {
    originalOrder.push(config.startPoint);
  } else if (config.endPoint && !config.isRoundTrip) {
    originalOrder.push(config.endPoint);
  }

  const originalMetrics = await calculateTotalDistanceAsync(originalOrder, useRoadRouting);
  const originalDistance = originalMetrics.distance;
  const originalTime = originalMetrics.duration;

  // Calculate savings
  const distanceSaved = Math.max(0, originalDistance - totalDistance);
  const timeSaved = Math.max(0, originalTime - totalTime);
  const improvementPercent = originalDistance > 0 ? (distanceSaved / originalDistance) * 100 : 0;

  return {
    routeId: `route-${Date.now()}`,
    optimizedStops: completeOptimizedRoute.map((stop, i) => ({
      ...stop,
      sequenceNumber: i + 1,
    })),
    totalDistance,
    totalTime,
    distanceMatrix: buildDistanceMatrix(completeOptimizedRoute),
    optimizationMode: OptimizationMode.NEAREST_NEIGHBOR,
    routingMode: useRoadRouting ? RoutingMode.ROAD : RoutingMode.STRAIGHT_LINE,
    optimizedAt: new Date(),

    // Comparison metrics
    originalDistance,
    originalTime,
    distanceSaved,
    timeSaved,
    improvementPercent,
  };
}

/**
 * Generate a unique ID for a route stop
 */
export function generateStopId(): string {
  return `stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID for a route
 */
export function generateRouteId(): string {
  return `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique ID for a route template
 */
export function generateTemplateId(): string {
  return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate coordinates are within valid ranges
 *
 * @param coordinates Coordinates to validate
 * @returns true if valid, false otherwise
 */
export function validateCoordinates(coordinates: Coordinates): boolean {
  return (
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180
  );
}
