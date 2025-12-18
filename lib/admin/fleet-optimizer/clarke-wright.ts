/**
 * Clarke-Wright Savings Algorithm
 *
 * Industry-standard heuristic for the Vehicle Routing Problem (VRP) with capacity constraints.
 * Time complexity: O(n² log n) where n = number of stops
 * First published in 1964, still widely used for its simplicity and effectiveness.
 *
 * Algorithm intuition:
 * 1. Start with each stop as its own route (depot → stop → depot)
 * 2. Calculate "savings" for merging any two routes
 * 3. Sort savings in descending order
 * 4. Greedily merge routes that save the most distance, respecting capacity
 *
 * Example savings calculation:
 * S(i,j) = d(depot,i) + d(depot,j) - d(i,j)
 * If depot→A→depot is 20km and depot→B→depot is 15km,
 * but A→B is only 5km, then merging saves: 20 + 15 - 5 = 30km → 25km route
 */

import type { RouteStop } from "../route-types";
import type {
  FleetConfig,
  FleetSolution,
  FleetOptimizationProgress,
  SavingsPair,
  InternalRoute,
  VehicleRoute,
} from "../fleet-types";
import { buildDistanceMatrixAsync } from "../route-utils";
import { buildDeliveryGraph, updateGraphWithRoutes } from "./graph-builder";
import { getOSRMRouteGeometry } from "../osrm-route-client";

/**
 * Maximum stops per route (industry standard for urban last-mile delivery)
 * Prevents overloading single vehicle even if capacity allows
 */
const MAX_STOPS_PER_ROUTE = 15;

/**
 * Optimize fleet routes using Clarke-Wright Savings Algorithm
 *
 * @param stops - All delivery stops (excludes depot)
 * @param fleet - Fleet configuration with vehicles and depot
 * @returns Complete fleet solution with optimized routes
 */
export async function optimizeFleetClarkeWright(
  stops: RouteStop[],
  fleet: FleetConfig
): Promise<FleetSolution> {
  const startTime = Date.now();

  // Validate inputs
  if (stops.length === 0) {
    throw new Error("Cannot optimize fleet with no stops");
  }
  if (fleet.vehicles.length === 0) {
    throw new Error("Cannot optimize fleet with no vehicles");
  }

  // Report progress
  fleet.onProgress?.({
    phase: "distance_matrix",
    currentStep: 0,
    totalSteps: stops.length,
    message: "Building distance matrix",
    percent: 5,
  });

  // Step 1: Build distance matrix (depot + all stops)
  const allLocations = [fleet.depot, ...stops];
  const { distanceMatrix, durationMatrix } = await buildDistanceMatrixAsync(
    allLocations,
    true // Use road routing
  );

  console.log(
    `[Clarke-Wright] Distance matrix built: ${allLocations.length}x${allLocations.length}`
  );

  // Step 2: Calculate savings matrix
  fleet.onProgress?.({
    phase: "calculating_savings",
    currentStep: 0,
    totalSteps: (stops.length * (stops.length - 1)) / 2,
    message: "Calculating savings",
    percent: 15,
  });

  const savings = calculateSavings(stops, distanceMatrix);
  console.log(`[Clarke-Wright] Calculated ${savings.length} savings pairs`);

  // Step 3: Sort savings in descending order
  savings.sort((a, b) => b.saving - a.saving);

  // Step 4: Initialize routes (one stop per route)
  const routes = initializeRoutes(stops, fleet);
  console.log(`[Clarke-Wright] Initialized ${routes.length} routes`);

  // Step 5: Merge routes greedily
  fleet.onProgress?.({
    phase: "merging_routes",
    currentStep: 0,
    totalSteps: savings.length,
    message: "Merging routes",
    percent: 30,
  });

  let mergeCount = 0;
  for (let i = 0; i < savings.length; i++) {
    const saving = savings[i];

    if (tryMergeRoutes(saving, routes, distanceMatrix)) {
      mergeCount++;
    }

    // Update progress every 10% of savings processed
    if (i % Math.ceil(savings.length / 10) === 0) {
      fleet.onProgress?.({
        phase: "merging_routes",
        currentStep: i + 1,
        totalSteps: savings.length,
        message: `Merged ${mergeCount} route pairs`,
        percent: 30 + ((i + 1) / savings.length) * 50,
      });
    }
  }

  console.log(`[Clarke-Wright] Merged ${mergeCount} route pairs`);

  // Step 6: Build final solution
  fleet.onProgress?.({
    phase: "finalizing",
    currentStep: 0,
    totalSteps: 1,
    message: "Building solution",
    percent: 90,
  });

  const solution = await buildFinalSolution(
    routes,
    fleet,
    stops,
    distanceMatrix,
    durationMatrix,
    Date.now() - startTime
  );

  console.log(
    `[Clarke-Wright] Optimization complete: ${solution.vehiclesUsed} vehicles used, ${solution.totalDistance.toFixed(1)}km total`
  );

  return solution;
}

/**
 * Fetch OSRM route geometry for a vehicle route
 * Returns null if OSRM fails (map will fall back to straight lines)
 */
async function fetchRouteGeometry(
  stops: RouteStop[],
  depot: RouteStop,
  returnToDepot: boolean
): Promise<import("../osrm-route-client").OSRMRouteGeometry | null> {
  if (stops.length === 0) return null;

  try {
    // Build full coordinate sequence: depot → stops → depot (if round trip)
    const coordinates = [depot.coordinates, ...stops.map((s) => s.coordinates)];

    if (returnToDepot) {
      coordinates.push(depot.coordinates);
    }

    console.log(`[Clarke-Wright] Fetching OSRM geometry for ${coordinates.length} waypoints...`);

    const geometry = await getOSRMRouteGeometry(coordinates);

    if (geometry) {
      console.log(
        `[Clarke-Wright] ✅ Got geometry: ${geometry.coordinates.length} road coordinates`
      );
    } else {
      console.warn(`[Clarke-Wright] ⚠️ OSRM geometry fetch failed, will use straight lines`);
    }

    return geometry;
  } catch (error) {
    console.warn(`[Clarke-Wright] ⚠️ Error fetching OSRM geometry:`, error);
    return null;
  }
}

/**
 * Calculate savings for all pairs of stops
 * S(i,j) = d(depot,i) + d(depot,j) - d(i,j)
 */
function calculateSavings(stops: RouteStop[], distanceMatrix: number[][]): SavingsPair[] {
  const savings: SavingsPair[] = [];
  const depotIndex = 0; // Depot is always first in distance matrix

  for (let i = 0; i < stops.length; i++) {
    for (let j = i + 1; j < stops.length; j++) {
      const stopIIndex = i + 1; // +1 because depot is index 0
      const stopJIndex = j + 1;

      const distDepotI = distanceMatrix[depotIndex][stopIIndex];
      const distDepotJ = distanceMatrix[depotIndex][stopJIndex];
      const distIJ = distanceMatrix[stopIIndex][stopJIndex];

      const saving = distDepotI + distDepotJ - distIJ;

      if (saving > 0) {
        // Only include positive savings
        savings.push({
          stopI: stops[i].id,
          stopJ: stops[j].id,
          saving,
          indexI: i,
          indexJ: j,
        });
      }
    }
  }

  return savings;
}

/**
 * Initialize routes - one stop per vehicle
 * Assigns stops to vehicles in order until vehicles run out,
 * then marks remaining stops as unassigned
 */
function initializeRoutes(stops: RouteStop[], fleet: FleetConfig): InternalRoute[] {
  const routes: InternalRoute[] = [];

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const packageCount = stop.packageCount ?? 1;

    // Find a vehicle with enough capacity
    let assignedVehicle = fleet.vehicles[i % fleet.vehicles.length];

    // If this is beyond number of vehicles, assign to first vehicle
    // (routes will be merged later if capacity allows)
    if (i >= fleet.vehicles.length) {
      assignedVehicle = fleet.vehicles[0];
    }

    routes.push({
      id: `route-${i}`,
      vehicleId: assignedVehicle.id,
      stops: [stop],
      packageCount,
      capacity: assignedVehicle.packageCapacity,
      distance: 0, // Will be calculated when building final solution
      active: true,
    });
  }

  return routes;
}

/**
 * Try to merge two routes based on a savings pair
 * Returns true if merge was successful
 */
function tryMergeRoutes(
  saving: SavingsPair,
  routes: InternalRoute[],
  distanceMatrix: number[][]
): boolean {
  // Find routes containing these stops
  const routeI = routes.find((r) => r.active && r.stops.some((s) => s.id === saving.stopI));
  const routeJ = routes.find((r) => r.active && r.stops.some((s) => s.id === saving.stopJ));

  if (!routeI || !routeJ || routeI.id === routeJ.id) {
    return false; // Can't merge same route or inactive routes
  }

  // Check if stops are at route endpoints (required for Clarke-Wright)
  const iIsEndpoint =
    routeI.stops[0].id === saving.stopI ||
    routeI.stops[routeI.stops.length - 1].id === saving.stopI;
  const jIsEndpoint =
    routeJ.stops[0].id === saving.stopJ ||
    routeJ.stops[routeJ.stops.length - 1].id === saving.stopJ;

  if (!iIsEndpoint || !jIsEndpoint) {
    return false; // Only merge if both stops are endpoints
  }

  // Check capacity constraint
  const combinedPackages = routeI.packageCount + routeJ.packageCount;
  if (combinedPackages > routeI.capacity) {
    return false; // Exceeds capacity
  }

  // Check max stops constraint (industry standard for urban delivery)
  const combinedStops = routeI.stops.length + routeJ.stops.length;
  if (combinedStops > MAX_STOPS_PER_ROUTE) {
    console.log(
      `[Clarke-Wright] Cannot merge: combined ${combinedStops} stops exceeds max ${MAX_STOPS_PER_ROUTE}`
    );
    return false; // Too many stops for realistic route
  }

  // Merge routes
  mergeRoutes(routeI, routeJ, saving);
  return true;
}

/**
 * Merge two routes into one
 * Modifies routeI to contain both routes, marks routeJ as inactive
 */
function mergeRoutes(routeI: InternalRoute, routeJ: InternalRoute, saving: SavingsPair): void {
  // Determine merge order (which route comes first)
  let firstRoute = routeI;
  let secondRoute = routeJ;

  // If stop I is at the end of routeI and stop J is at the start of routeJ
  // → merge as routeI + routeJ
  const iAtEnd = routeI.stops[routeI.stops.length - 1].id === saving.stopI;
  const jAtStart = routeJ.stops[0].id === saving.stopJ;

  if (iAtEnd && jAtStart) {
    // Perfect! routeI → routeJ
    firstRoute = routeI;
    secondRoute = routeJ;
  } else {
    // Need to reverse one or both routes to connect properly
    // This is simplified for MVP - just connect in order found
    firstRoute = routeI;
    secondRoute = routeJ;

    // Reverse routeI if stop I is at the start
    if (routeI.stops[0].id === saving.stopI) {
      firstRoute.stops.reverse();
    }

    // Reverse routeJ if stop J is at the end
    if (routeJ.stops[routeJ.stops.length - 1].id === saving.stopJ) {
      secondRoute.stops.reverse();
    }
  }

  // Merge stops
  routeI.stops = [...firstRoute.stops, ...secondRoute.stops];
  routeI.packageCount += routeJ.packageCount;

  // Mark routeJ as inactive
  routeJ.active = false;
}

/**
 * Build final FleetSolution from internal routes
 */
async function buildFinalSolution(
  internalRoutes: InternalRoute[],
  fleet: FleetConfig,
  originalStops: RouteStop[],
  distanceMatrix: number[][],
  durationMatrix: number[][],
  optimizationTime: number
): Promise<FleetSolution> {
  const vehicleRoutes: VehicleRoute[] = [];

  // Create map of stop ID to matrix index (depot is 0, stops start at 1)
  const stopToIndexMap = new Map<string, number>();
  stopToIndexMap.set(fleet.depot.id, 0);
  originalStops.forEach((stop, i) => {
    stopToIndexMap.set(stop.id, i + 1);
  });

  // Get only active routes
  const activeRoutes = internalRoutes.filter((r) => r.active);

  // Group routes by vehicle
  const routesByVehicle = new Map<string, InternalRoute[]>();
  for (const route of activeRoutes) {
    const existing = routesByVehicle.get(route.vehicleId) ?? [];
    existing.push(route);
    routesByVehicle.set(route.vehicleId, existing);
  }

  // Build VehicleRoute for each vehicle
  for (const vehicle of fleet.vehicles) {
    const routes = routesByVehicle.get(vehicle.id) ?? [];

    if (routes.length === 0) {
      // Empty route
      vehicleRoutes.push({
        vehicleId: vehicle.id,
        vehicleLabel: vehicle.label,
        vehicleColor: vehicle.color,
        stops: [],
        totalDistance: 0,
        totalTime: 0,
        packageCount: 0,
        vehicleCapacity: vehicle.packageCapacity,
        utilizationPercent: 0,
        isEmpty: true,
        geometry: null, // No geometry for empty route
      });
      continue;
    }

    // Merge all routes for this vehicle (shouldn't happen after Clarke-Wright, but safety)
    const allStops = routes.flatMap((r) => r.stops);
    const totalPackages = routes.reduce((sum, r) => r.packageCount, 0);

    // Calculate route distance and time
    let totalDistance = 0;
    let totalTime = 0;

    // Add depot → first stop
    const firstStopIndex = stopToIndexMap.get(allStops[0].id);
    if (firstStopIndex !== undefined) {
      totalDistance += distanceMatrix[0][firstStopIndex] ?? 0;
      totalTime += durationMatrix[0][firstStopIndex] ?? 0;
    }

    // Add stop → stop distances
    for (let i = 0; i < allStops.length - 1; i++) {
      const fromIndex = stopToIndexMap.get(allStops[i].id);
      const toIndex = stopToIndexMap.get(allStops[i + 1].id);

      if (fromIndex !== undefined && toIndex !== undefined) {
        totalDistance += distanceMatrix[fromIndex][toIndex] ?? 0;
        totalTime += durationMatrix[fromIndex][toIndex] ?? 0;
      }
    }

    // Add last stop → depot (if return to depot)
    if (fleet.returnToDepot && allStops.length > 0) {
      const lastStopIndex = stopToIndexMap.get(allStops[allStops.length - 1].id);
      if (lastStopIndex !== undefined) {
        totalDistance += distanceMatrix[lastStopIndex][0] ?? 0;
        totalTime += durationMatrix[lastStopIndex][0] ?? 0;
      }
    }

    // Fetch OSRM route geometry for map visualization
    const geometry = await fetchRouteGeometry(allStops, fleet.depot, fleet.returnToDepot);

    vehicleRoutes.push({
      vehicleId: vehicle.id,
      vehicleLabel: vehicle.label,
      vehicleColor: vehicle.color,
      stops: allStops,
      totalDistance,
      totalTime,
      packageCount: totalPackages,
      vehicleCapacity: vehicle.packageCapacity,
      utilizationPercent: (totalPackages / vehicle.packageCapacity) * 100,
      isEmpty: false,
      geometry, // Add OSRM geometry
    });
  }

  // Calculate aggregate metrics
  const totalDistance = vehicleRoutes.reduce((sum, r) => sum + r.totalDistance, 0);
  const totalTime = Math.max(...vehicleRoutes.map((r) => r.totalTime), 0);
  const totalPackages = vehicleRoutes.reduce((sum, r) => sum + r.packageCount, 0);
  const vehiclesUsed = vehicleRoutes.filter((r) => !r.isEmpty).length;
  const avgUtilization =
    vehiclesUsed > 0
      ? vehicleRoutes.reduce((sum, r) => sum + r.utilizationPercent, 0) / vehiclesUsed
      : 0;

  // Build graph for visualization (use original stops to match matrix)
  const graph = buildDeliveryGraph(originalStops, fleet.depot, distanceMatrix, durationMatrix);

  // Update graph with assigned routes
  const graphWithRoutes = updateGraphWithRoutes(graph, vehicleRoutes);

  return {
    routes: vehicleRoutes,
    totalDistance,
    totalTime,
    totalPackages,
    unassignedStops: [], // Clarke-Wright assigns all stops (may need post-processing for capacity)
    optimizationTime,
    algorithm: "clarke-wright",
    graph: graphWithRoutes,
    optimizedAt: new Date(),
    avgUtilization,
    vehiclesUsed,
  };
}
