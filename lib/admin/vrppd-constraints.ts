/**
 * VRPPD Constraint Validation
 *
 * Vehicle Routing Problem with Pickup and Delivery (VRPPD) constraint validators.
 * Phase 2: Validation only - detects violations but doesn't modify routes.
 * Phase 3 will add VRPPD-aware optimization algorithm.
 */

import type { RouteStop } from "./route-types";
import type { DeliveryTicket } from "./driver-assist-types";

/**
 * Violation report for constraint violations
 */
export interface ViolationReport {
  /** Type of constraint violated */
  type: "precedence" | "pairing" | "time-window" | "missing-pair";
  /** Stop ID where violation occurred */
  stopId: string;
  /** Paired stop ID (if relevant) */
  pairedStopId?: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether route is valid (respects all constraints) */
  valid: boolean;
  /** List of constraint violations (empty if valid) */
  violations: ViolationReport[];
}

/**
 * Validate that a single route respects all VRPPD constraints
 *
 * Checks:
 * - Precedence: Pickup must come before dropoff
 * - Pairing completeness: Both pickup and dropoff present
 * - Time windows: (future - Phase 5)
 *
 * @param stops - Route stops in order
 * @returns Validation result with violations if any
 */
export function validateVRPPDRoute(stops: RouteStop[]): ValidationResult {
  const violations: ViolationReport[] = [];

  // Check precedence constraint
  const precedenceViolations = checkPrecedence(stops);
  violations.push(...precedenceViolations);

  // Check pairing completeness
  const pairingViolations = checkPairingCompleteness(stops);
  violations.push(...pairingViolations);

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Check precedence constraint: pickup must come before dropoff
 *
 * @param stops - Route stops in order
 * @returns List of precedence violations
 */
export function checkPrecedence(stops: RouteStop[]): ViolationReport[] {
  const violations: ViolationReport[] = [];
  const stopMap = new Map(stops.map((s, i) => [s.id, i]));

  for (const stop of stops) {
    // Only check dropoff stops with paired pickups
    if (stop.stopType === "dropoff" && stop.pairedStopId) {
      const pickupIndex = stopMap.get(stop.pairedStopId);
      const dropoffIndex = stopMap.get(stop.id);

      if (pickupIndex === undefined) {
        // Missing paired pickup
        violations.push({
          type: "missing-pair",
          stopId: stop.id,
          pairedStopId: stop.pairedStopId,
          message: `Dropoff stop "${stop.address}" (${stop.id}) is missing paired pickup stop (${stop.pairedStopId})`,
        });
        continue;
      }

      if (dropoffIndex === undefined) {
        // Shouldn't happen, but safety check
        continue;
      }

      if (pickupIndex >= dropoffIndex) {
        // Dropoff before pickup - VIOLATION
        violations.push({
          type: "precedence",
          stopId: stop.id,
          pairedStopId: stop.pairedStopId,
          message: `Dropoff stop "${stop.address}" (position ${dropoffIndex + 1}) must come after pickup stop (position ${pickupIndex + 1})`,
        });
      }
    }
  }

  return violations;
}

/**
 * Check pairing completeness: both pickup and dropoff must be present
 *
 * @param stops - Route stops in order
 * @returns List of missing pair violations
 */
export function checkPairingCompleteness(stops: RouteStop[]): ViolationReport[] {
  const violations: ViolationReport[] = [];
  const stopIds = new Set(stops.map((s) => s.id));

  for (const stop of stops) {
    // Check if pickup has its dropoff
    if (stop.stopType === "pickup" && stop.pairedStopId) {
      if (!stopIds.has(stop.pairedStopId)) {
        violations.push({
          type: "missing-pair",
          stopId: stop.id,
          pairedStopId: stop.pairedStopId,
          message: `Pickup stop "${stop.address}" (${stop.id}) is missing paired dropoff stop (${stop.pairedStopId})`,
        });
      }
    }

    // Check if dropoff has its pickup (already checked in precedence, but double-check)
    if (stop.stopType === "dropoff" && stop.pairedStopId) {
      if (!stopIds.has(stop.pairedStopId)) {
        // Only add if not already reported in precedence check
        const alreadyReported = violations.some(
          (v) => v.stopId === stop.id && v.type === "missing-pair"
        );
        if (!alreadyReported) {
          violations.push({
            type: "missing-pair",
            stopId: stop.id,
            pairedStopId: stop.pairedStopId,
            message: `Dropoff stop "${stop.address}" (${stop.id}) is missing paired pickup stop (${stop.pairedStopId})`,
          });
        }
      }
    }
  }

  return violations;
}

/**
 * Validate pairing constraint across multiple routes
 *
 * For strict pairing mode: both pickup and dropoff must be on same route
 *
 * @param routes - Array of routes (each route is array of stops)
 * @param tickets - Delivery tickets with pairing information
 * @returns Validation result
 */
export function validatePairingAcrossRoutes(
  routes: RouteStop[][],
  tickets: DeliveryTicket[]
): ValidationResult {
  const violations: ViolationReport[] = [];

  for (const ticket of tickets) {
    // Only check strict pairing mode
    if (ticket.pairingMode === "strict" && ticket.pickupStopId && ticket.dropoffStopId) {
      const pickupRoute = routes.findIndex((r) => r.some((s) => s.id === ticket.pickupStopId));
      const dropoffRoute = routes.findIndex((r) => r.some((s) => s.id === ticket.dropoffStopId));

      if (pickupRoute === -1) {
        violations.push({
          type: "missing-pair",
          stopId: ticket.pickupStopId,
          message: `Pickup stop for ticket ${ticket.ticketNumber || ticket.id} not found in any route`,
        });
      }

      if (dropoffRoute === -1) {
        violations.push({
          type: "missing-pair",
          stopId: ticket.dropoffStopId,
          message: `Dropoff stop for ticket ${ticket.ticketNumber || ticket.id} not found in any route`,
        });
      }

      if (pickupRoute !== -1 && dropoffRoute !== -1 && pickupRoute !== dropoffRoute) {
        violations.push({
          type: "pairing",
          stopId: ticket.pickupStopId,
          pairedStopId: ticket.dropoffStopId,
          message: `Strict pairing: Pickup (route ${pickupRoute + 1}) and dropoff (route ${dropoffRoute + 1}) must be on same route for ticket ${ticket.ticketNumber || ticket.id}`,
        });
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Get human-readable violation messages
 *
 * @param violations - Array of violation reports
 * @returns Array of formatted error messages
 */
export function getViolationMessages(violations: ViolationReport[]): string[] {
  return violations.map((v) => v.message);
}

/**
 * Check if route has any VRPPD constraints (optimization)
 *
 * Returns true if any stop has pickup/dropoff type.
 * Use this to skip validation for regular routes.
 *
 * @param stops - Route stops
 * @returns True if route uses VRPPD features
 */
export function hasVRPPDConstraints(stops: RouteStop[]): boolean {
  return stops.some((s) => s.stopType === "pickup" || s.stopType === "dropoff");
}

/**
 * Get default stop type for backward compatibility
 *
 * @param stop - Route stop
 * @returns Stop type (defaults to 'delivery')
 */
export function getStopType(stop: RouteStop): "pickup" | "dropoff" | "delivery" {
  return stop.stopType || "delivery";
}

/**
 * Get default pairing mode for backward compatibility
 *
 * @param ticket - Delivery ticket
 * @returns Pairing mode (defaults to 'none')
 */
export function getPairingMode(ticket: DeliveryTicket): "strict" | "flexible" | "none" {
  return ticket.pairingMode || "none";
}
