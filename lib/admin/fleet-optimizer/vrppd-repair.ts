/**
 * VRPPD Constraint Repair
 *
 * Post-processing utilities to fix pickup/dropoff precedence violations
 * after Clarke-Wright optimization.
 *
 * Clarke-Wright doesn't natively handle VRPPD constraints, so we:
 * 1. Run Clarke-Wright to get initial assignment
 * 2. Validate each route for VRPPD violations
 * 3. Repair violations by reordering or moving stops
 * 4. Re-validate until clean or mark as infeasible
 */

import type { RouteStop } from "../route-types";
import type { VehicleRoute, FleetSolution } from "../fleet-types";
import {
  validateVRPPDRoute,
  type ViolationReport,
} from "../vrppd-constraints";

/**
 * Repair VRPPD violations in a fleet solution
 *
 * @param solution - Fleet solution from Clarke-Wright
 * @returns Updated solution with violations fixed (or marked as infeasible)
 */
export function repairVRPPDViolations(solution: FleetSolution): {
  solution: FleetSolution;
  violations: ViolationReport[];
  repaired: boolean;
} {
  const violations: ViolationReport[] = [];
  const repairedRoutes: VehicleRoute[] = [];
  let allRepaired = true;

  for (const route of solution.routes) {
    if (route.isEmpty) {
      repairedRoutes.push(route);
      continue;
    }

    // Validate route
    const validation = validateVRPPDRoute(route.stops);

    if (validation.valid) {
      // No violations, keep as-is
      repairedRoutes.push(route);
      continue;
    }

    // Try to repair violations
    const { repairedStops, success, remainingViolations } = repairRoute(
      route.stops
    );

    if (success) {
      // Repair successful
      repairedRoutes.push({
        ...route,
        stops: repairedStops,
      });
    } else {
      // Repair failed, keep original but log violations
      repairedRoutes.push(route);
      violations.push(...remainingViolations);
      allRepaired = false;
    }
  }

  return {
    solution: {
      ...solution,
      routes: repairedRoutes,
    },
    violations,
    repaired: allRepaired,
  };
}

/**
 * Repair VRPPD violations in a single route
 *
 * Strategies:
 * 1. Precedence violations: Swap pickup and dropoff if on same route
 * 2. Missing pair: Can't fix in single route (needs cross-route repair)
 *
 * @param stops - Route stops in current order
 * @returns Repaired stops and success status
 */
function repairRoute(stops: RouteStop[]): {
  repairedStops: RouteStop[];
  success: boolean;
  remainingViolations: ViolationReport[];
} {
  let currentStops = [...stops];
  let maxIterations = 10; // Prevent infinite loops
  let iterations = 0;

  while (iterations < maxIterations) {
    const validation = validateVRPPDRoute(currentStops);

    if (validation.valid) {
      // Repair successful!
      return {
        repairedStops: currentStops,
        success: true,
        remainingViolations: [],
      };
    }

    // Try to fix precedence violations
    let fixed = false;
    for (const violation of validation.violations) {
      if (violation.type === "precedence") {
        const repaired = fixPrecedenceViolation(
          currentStops,
          violation.stopId,
          violation.pairedStopId!
        );

        if (repaired) {
          currentStops = repaired;
          fixed = true;
          break; // Re-validate after each fix
        }
      }
    }

    if (!fixed) {
      // Can't fix remaining violations
      return {
        repairedStops: currentStops,
        success: false,
        remainingViolations: validation.violations,
      };
    }

    iterations++;
  }

  // Max iterations reached
  return {
    repairedStops: currentStops,
    success: false,
    remainingViolations: validateVRPPDRoute(currentStops).violations,
  };
}

/**
 * Fix a precedence violation by swapping pickup and dropoff
 *
 * @param stops - Current route stops
 * @param dropoffId - ID of dropoff stop (comes before pickup - WRONG)
 * @param pickupId - ID of pickup stop (comes after dropoff - WRONG)
 * @returns Reordered stops or null if can't fix
 */
function fixPrecedenceViolation(
  stops: RouteStop[],
  dropoffId: string,
  pickupId: string
): RouteStop[] | null {
  const pickupIndex = stops.findIndex((s) => s.id === pickupId);
  const dropoffIndex = stops.findIndex((s) => s.id === dropoffId);

  if (pickupIndex === -1 || dropoffIndex === -1) {
    return null; // Can't find stops
  }

  if (pickupIndex < dropoffIndex) {
    // Already in correct order (shouldn't happen if violation detected)
    return stops;
  }

  // Swap pickup and dropoff positions
  const reordered = [...stops];
  const pickupStop = reordered[pickupIndex];
  const dropoffStop = reordered[dropoffIndex];

  reordered[pickupIndex] = dropoffStop;
  reordered[dropoffIndex] = pickupStop;

  return reordered;
}

/**
 * Check if a route has any VRPPD stops (pickup or dropoff)
 */
export function hasVRPPDStops(stops: RouteStop[]): boolean {
  return stops.some((s) => s.stopType === "pickup" || s.stopType === "dropoff");
}

/**
 * Get summary of VRPPD constraint status for a solution
 */
export interface VRPPDSummary {
  totalPickups: number;
  totalDropoffs: number;
  violationCount: number;
  violationsByType: Record<string, number>;
  isValid: boolean;
}

export function getVRPPDSummary(solution: FleetSolution): VRPPDSummary {
  let totalPickups = 0;
  let totalDropoffs = 0;
  const violations: ViolationReport[] = [];
  const violationsByType: Record<string, number> = {};

  for (const route of solution.routes) {
    if (route.isEmpty) continue;

    // Count pickups and dropoffs
    for (const stop of route.stops) {
      if (stop.stopType === "pickup") totalPickups++;
      if (stop.stopType === "dropoff") totalDropoffs++;
    }

    // Validate route
    const validation = validateVRPPDRoute(route.stops);
    if (!validation.valid) {
      violations.push(...validation.violations);

      for (const v of validation.violations) {
        violationsByType[v.type] = (violationsByType[v.type] ?? 0) + 1;
      }
    }
  }

  return {
    totalPickups,
    totalDropoffs,
    violationCount: violations.length,
    violationsByType,
    isValid: violations.length === 0,
  };
}
