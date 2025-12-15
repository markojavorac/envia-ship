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
import { getCachedDistance, cacheDistance, getCachedMatrix, cacheMatrix } from "./distance-cache";
import { getOSRMDistanceMatrix, hasUnreachablePairs } from "./osrm-table-client";

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
 * Build a distance matrix for all stops (LEGACY - Haversine only)
 *
 * @deprecated Use buildDistanceMatrixAsync for road-based routing
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
 * Build distance and duration matrices using OSRM Table API (async)
 *
 * This is MUCH faster than n² point-to-point requests:
 * - 25 stops: 1 API call instead of ~300 calls
 * - 50 stops: 1 API call instead of ~1,225 calls
 *
 * Falls back gracefully:
 * 1. Try OSRM Table API (fast, accurate)
 * 2. If fails → Point-to-point OSRM with cache (slower, accurate)
 * 3. If fails → Haversine (instant, approximate)
 *
 * @param stops Array of route stops
 * @param useRoadRouting If true, use OSRM; if false, use Haversine
 * @param onProgress Optional progress callback
 * @returns Distance matrix (km), duration matrix (min), and method used
 */
export async function buildDistanceMatrixAsync(
  stops: RouteStop[],
  useRoadRouting: boolean = true,
  onProgress?: (phase: string, percent: number) => void
): Promise<{
  distanceMatrix: number[][];
  durationMatrix: number[][];
  method: "osrm-table" | "osrm-point-to-point" | "haversine";
}> {
  const n = stops.length;

  const coordinates = stops.map((s) => s.coordinates);

  // Report progress
  onProgress?.("distance_matrix", 10);

  // Check cache first
  const cachedResult = getCachedMatrix(coordinates);
  if (cachedResult) {
    console.log(
      `[Distance Matrix] ✅ Using cached ${n}x${n} matrix (method: ${cachedResult.method})`
    );
    onProgress?.("distance_matrix", 100);
    return {
      distanceMatrix: cachedResult.distanceMatrix,
      durationMatrix: cachedResult.durationMatrix,
      method: cachedResult.method,
    };
  }

  // If not using road routing, use Haversine immediately
  if (!useRoadRouting) {
    console.log("[Distance Matrix] Using Haversine (road routing disabled)");
    const distanceMatrix = buildDistanceMatrix(stops);
    const durationMatrix = distanceMatrix.map((row) => row.map((dist) => estimateTravelTime(dist)));
    onProgress?.("distance_matrix", 100);

    // Cache the result
    cacheMatrix(coordinates, {
      coordinates,
      distanceMatrix,
      durationMatrix,
      method: "haversine",
    });

    return { distanceMatrix, durationMatrix, method: "haversine" };
  }

  // Strategy 1: Try OSRM Table API (single batch request)
  try {
    console.log(`[Distance Matrix] Attempting OSRM Table API for ${n}x${n} matrix`);
    onProgress?.("distance_matrix", 30);

    const tableResult = await getOSRMDistanceMatrix(coordinates);

    if (tableResult) {
      const { distances, durations } = tableResult;

      // Check for unreachable pairs (null cells converted to 0)
      if (hasUnreachablePairs(distances)) {
        console.warn("[Distance Matrix] ⚠️  Some routes unreachable, filling with Haversine");
        // Fill null cells with Haversine estimates
        fillUnreachablePairs(stops, distances, durations);
      }

      console.log("[Distance Matrix] ✅ OSRM Table API success");
      onProgress?.("distance_matrix", 100);

      // Cache the result
      cacheMatrix(coordinates, {
        coordinates,
        distanceMatrix: distances,
        durationMatrix: durations,
        method: "osrm-table",
      });

      return {
        distanceMatrix: distances,
        durationMatrix: durations,
        method: "osrm-table",
      };
    }

    console.warn("[Distance Matrix] OSRM Table API failed, trying point-to-point");
  } catch (error) {
    console.warn("[Distance Matrix] OSRM Table API error:", error);
  }

  // Strategy 2: Fall back to point-to-point OSRM with caching
  try {
    console.log("[Distance Matrix] Attempting point-to-point OSRM with cache");
    onProgress?.("distance_matrix", 50);

    const distanceMatrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    const durationMatrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    let successCount = 0;
    let totalPairs = n * (n - 1); // Exclude diagonal

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          distanceMatrix[i][j] = 0;
          durationMatrix[i][j] = 0;
          continue;
        }

        try {
          const result = await getDistanceBetweenStops(
            stops[i].coordinates,
            stops[j].coordinates,
            true
          );
          distanceMatrix[i][j] = result.distance;
          durationMatrix[i][j] = result.duration;
          successCount++;
        } catch {
          // Fall back to Haversine for this pair
          const dist = haversineDistance(stops[i].coordinates, stops[j].coordinates);
          distanceMatrix[i][j] = dist;
          durationMatrix[i][j] = estimateTravelTime(dist);
        }
      }
    }

    // If at least 50% succeeded, consider it successful
    if (successCount >= totalPairs * 0.5) {
      console.log(
        `[Distance Matrix] ✅ Point-to-point OSRM success (${successCount}/${totalPairs} pairs)`
      );
      onProgress?.("distance_matrix", 100);

      // Cache the result
      cacheMatrix(coordinates, {
        coordinates,
        distanceMatrix,
        durationMatrix,
        method: "osrm-point-to-point",
      });

      return {
        distanceMatrix,
        durationMatrix,
        method: "osrm-point-to-point",
      };
    }

    console.warn(
      `[Distance Matrix] Point-to-point success rate too low (${successCount}/${totalPairs}), using Haversine`
    );
  } catch (error) {
    console.warn("[Distance Matrix] Point-to-point OSRM error:", error);
  }

  // Strategy 3: Final fallback to Haversine
  console.log("[Distance Matrix] Using Haversine fallback");
  onProgress?.("distance_matrix", 80);

  const distanceMatrix = buildDistanceMatrix(stops);
  const durationMatrix = distanceMatrix.map((row) => row.map((dist) => estimateTravelTime(dist)));

  onProgress?.("distance_matrix", 100);

  // Cache the result
  cacheMatrix(coordinates, {
    coordinates,
    distanceMatrix,
    durationMatrix,
    method: "haversine",
  });

  return { distanceMatrix, durationMatrix, method: "haversine" };
}

/**
 * Fill unreachable pairs (0 values) with Haversine estimates
 *
 * @param stops Route stops
 * @param distanceMatrix Distance matrix (modified in place)
 * @param durationMatrix Duration matrix (modified in place)
 */
function fillUnreachablePairs(
  stops: RouteStop[],
  distanceMatrix: number[][],
  durationMatrix: number[][]
): void {
  const n = stops.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;

      // If distance is 0 (unreachable or null), use Haversine
      if (distanceMatrix[i][j] === 0) {
        const dist = haversineDistance(stops[i].coordinates, stops[j].coordinates);
        distanceMatrix[i][j] = dist;
        durationMatrix[i][j] = estimateTravelTime(dist);
      }
    }
  }
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
 * Calculate total distance and duration from pre-built distance/duration matrices
 *
 * This is MUCH faster than making API calls for each leg of the route.
 * Use after optimization when you have the complete matrices.
 *
 * @param stopSequence Array of stops in route order
 * @param distanceMatrix Pre-built distance matrix (km)
 * @param durationMatrix Pre-built duration matrix (minutes)
 * @param stopIndexMap Map from stop ID to matrix index
 * @returns Total distance (km) and duration (minutes)
 */
function calculateRouteMetricsFromMatrix(
  stopSequence: RouteStop[],
  distanceMatrix: number[][],
  durationMatrix: number[][],
  stopIndexMap: Map<string, number>
): { totalDistance: number; totalTime: number } {
  if (stopSequence.length < 2) {
    return { totalDistance: 0, totalTime: 0 };
  }

  let totalDistance = 0;
  let totalTime = 0;

  // Sum up distances/durations between consecutive stops
  for (let i = 0; i < stopSequence.length - 1; i++) {
    const fromIdx = stopIndexMap.get(stopSequence[i].id);
    const toIdx = stopIndexMap.get(stopSequence[i + 1].id);

    if (fromIdx === undefined || toIdx === undefined) {
      console.warn(
        `[Route Metrics] Stop not found in matrix: ${stopSequence[i].id} or ${stopSequence[i + 1].id}`
      );
      // Fall back to Haversine for this leg
      const dist = haversineDistance(stopSequence[i].coordinates, stopSequence[i + 1].coordinates);
      totalDistance += dist;
      totalTime += estimateTravelTime(dist);
      continue;
    }

    totalDistance += distanceMatrix[fromIdx][toIdx];
    totalTime += durationMatrix[fromIdx][toIdx];
  }

  return { totalDistance, totalTime };
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

  // Build distance matrix ONCE upfront (OSRM Table API - fast!)
  config.onProgress?.({
    phase: "distance_matrix",
    currentStep: 0,
    totalSteps: stops.length,
    message: "Building distance matrix",
    percent: 5,
  });

  const { distanceMatrix, durationMatrix, method } = await buildDistanceMatrixAsync(
    stops,
    useRoadRouting
  );

  console.log(
    `[Route Optimizer] Distance matrix built using: ${method} (${stops.length}x${stops.length})`
  );

  config.onProgress?.({
    phase: "nearest_neighbor",
    currentStep: 0,
    totalSteps: stops.length,
    message: "Optimizing route sequence",
    percent: 15,
  });

  // Create index map for fast lookups
  const stopIndexMap = new Map(stops.map((stop, index) => [stop.id, index]));

  // Nearest Neighbor greedy algorithm (using pre-built matrix)
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    // Get current stop's index in original stops array
    const currentIdx = stopIndexMap.get(current.id);
    if (currentIdx === undefined) {
      throw new Error(`Stop ${current.id} not found in index map`);
    }

    // Find nearest unvisited stop (instant matrix lookup!)
    for (let i = 0; i < unvisited.length; i++) {
      const candidateIdx = stopIndexMap.get(unvisited[i].id);
      if (candidateIdx === undefined) {
        throw new Error(`Stop ${unvisited[i].id} not found in index map`);
      }

      const distance = distanceMatrix[currentIdx][candidateIdx];
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Move to nearest stop
    current = unvisited[nearestIndex];
    ordered.push(current);
    unvisited.splice(nearestIndex, 1);

    // Report progress after each iteration
    config.onProgress?.({
      phase: "nearest_neighbor",
      currentStep: ordered.length,
      totalSteps: stops.length,
      message: "Finding optimal sequence",
      percent: 20 + Math.round((ordered.length / stops.length) * 60),
    });
  }

  // Build complete route with start/end points
  const completeOptimizedRoute: RouteStop[] = [];
  if (config.startPoint) {
    completeOptimizedRoute.push(config.startPoint);
  } else {
    // When no startPoint is configured, include the first stop (which was used as starting point)
    const firstStop = stops[0];
    completeOptimizedRoute.push(firstStop);
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

  // Report progress before metrics calculation
  config.onProgress?.({
    phase: "calculating_metrics",
    currentStep: stops.length,
    totalSteps: stops.length,
    message: "Calculating savings",
    percent: 85,
  });

  // Calculate optimized route metrics from pre-built matrices (instant!)
  const { totalDistance, totalTime } = calculateRouteMetricsFromMatrix(
    completeOptimizedRoute,
    distanceMatrix,
    durationMatrix,
    stopIndexMap
  );

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

  const { totalDistance: originalDistance, totalTime: originalTime } =
    calculateRouteMetricsFromMatrix(originalOrder, distanceMatrix, durationMatrix, stopIndexMap);

  // Calculate savings
  const distanceSaved = Math.max(0, originalDistance - totalDistance);
  const timeSaved = Math.max(0, originalTime - totalTime);
  const improvementPercent = originalDistance > 0 ? (distanceSaved / originalDistance) * 100 : 0;

  // Report completion
  config.onProgress?.({
    phase: "calculating_metrics",
    currentStep: stops.length,
    totalSteps: stops.length,
    message: "Complete",
    percent: 100,
  });

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
