/**
 * VRPPD Constraint Validation - Unit Tests
 *
 * Tests for Vehicle Routing Problem with Pickup and Delivery validators
 */

import {
  validateVRPPDRoute,
  checkPrecedence,
  checkPairingCompleteness,
  validatePairingAcrossRoutes,
  getViolationMessages,
  hasVRPPDConstraints,
  getStopType,
  getPairingMode,
} from "../lib/admin/vrppd-constraints";
import type { RouteStop } from "../lib/admin/route-types";
import type { DeliveryTicket } from "../lib/admin/driver-assist-types";

// Helper function to create test stops
const createStop = (
  id: string,
  address: string,
  stopType?: "pickup" | "dropoff" | "delivery",
  pairedStopId?: string
): RouteStop => ({
  id,
  address,
  coordinates: { lat: 14.6349, lng: -90.5069 }, // Guatemala City
  stopType,
  pairedStopId,
});

describe("VRPPD Constraint Validation", () => {
  describe("checkPrecedence", () => {
    test("accepts route with pickup before dropoff", () => {
      const stops = [
        createStop("1", "Warehouse A", "pickup"),
        createStop("2", "Customer B", "dropoff", "1"),
      ];

      const violations = checkPrecedence(stops);
      expect(violations).toHaveLength(0);
    });

    test("rejects route with dropoff before pickup", () => {
      const stops = [
        createStop("1", "Customer B", "dropoff", "2"),
        createStop("2", "Warehouse A", "pickup"),
      ];

      const violations = checkPrecedence(stops);
      expect(violations).toHaveLength(1);
      expect(violations[0].type).toBe("precedence");
      expect(violations[0].stopId).toBe("1");
      expect(violations[0].pairedStopId).toBe("2");
    });

    test("accepts multiple pickup/dropoff pairs in correct order", () => {
      const stops = [
        createStop("1", "Warehouse A", "pickup"),
        createStop("2", "Warehouse B", "pickup"),
        createStop("3", "Customer A", "dropoff", "1"),
        createStop("4", "Customer B", "dropoff", "2"),
      ];

      const violations = checkPrecedence(stops);
      expect(violations).toHaveLength(0);
    });

    test("accepts batched pickups before dropoffs (flexible mode)", () => {
      const stops = [
        createStop("1", "Warehouse A", "pickup"),
        createStop("2", "Warehouse B", "pickup"),
        createStop("3", "Warehouse C", "pickup"),
        createStop("4", "Customer A", "dropoff", "1"),
        createStop("5", "Customer B", "dropoff", "2"),
        createStop("6", "Customer C", "dropoff", "3"),
      ];

      const violations = checkPrecedence(stops);
      expect(violations).toHaveLength(0);
    });

    test("detects missing paired pickup", () => {
      const stops = [
        createStop("1", "Customer B", "dropoff", "999"), // Missing pickup 999
      ];

      const violations = checkPrecedence(stops);
      expect(violations).toHaveLength(1);
      expect(violations[0].type).toBe("missing-pair");
      expect(violations[0].stopId).toBe("1");
      expect(violations[0].pairedStopId).toBe("999");
    });

    test("ignores regular delivery stops", () => {
      const stops = [
        createStop("1", "Customer A", "delivery"),
        createStop("2", "Customer B", "delivery"),
      ];

      const violations = checkPrecedence(stops);
      expect(violations).toHaveLength(0);
    });

    test("accepts mixed delivery and pickup/dropoff stops", () => {
      const stops = [
        createStop("1", "Customer A", "delivery"),
        createStop("2", "Warehouse B", "pickup"),
        createStop("3", "Customer C", "delivery"),
        createStop("4", "Customer D", "dropoff", "2"),
      ];

      const violations = checkPrecedence(stops);
      expect(violations).toHaveLength(0);
    });
  });

  describe("checkPairingCompleteness", () => {
    test("accepts complete pickup/dropoff pairs", () => {
      const stops = [
        createStop("1", "Warehouse A", "pickup", "2"),
        createStop("2", "Customer B", "dropoff", "1"),
      ];

      const violations = checkPairingCompleteness(stops);
      expect(violations).toHaveLength(0);
    });

    test("detects pickup missing its dropoff", () => {
      const stops = [
        createStop("1", "Warehouse A", "pickup", "999"), // Missing dropoff 999
      ];

      const violations = checkPairingCompleteness(stops);
      expect(violations).toHaveLength(1);
      expect(violations[0].type).toBe("missing-pair");
      expect(violations[0].stopId).toBe("1");
      expect(violations[0].pairedStopId).toBe("999");
    });

    test("detects dropoff missing its pickup", () => {
      const stops = [
        createStop("1", "Customer B", "dropoff", "999"), // Missing pickup 999
      ];

      const violations = checkPairingCompleteness(stops);
      expect(violations).toHaveLength(1);
      expect(violations[0].type).toBe("missing-pair");
      expect(violations[0].stopId).toBe("1");
      expect(violations[0].pairedStopId).toBe("999");
    });

    test("ignores unpaired stops", () => {
      const stops = [
        createStop("1", "Warehouse A", "pickup"), // No pairedStopId
        createStop("2", "Customer B", "delivery"),
      ];

      const violations = checkPairingCompleteness(stops);
      expect(violations).toHaveLength(0);
    });
  });

  describe("validateVRPPDRoute", () => {
    test("accepts valid route with mixed stops", () => {
      const stops = [
        createStop("1", "Warehouse A", "pickup", "3"),
        createStop("2", "Customer B", "delivery"),
        createStop("3", "Customer C", "dropoff", "1"),
        createStop("4", "Customer D", "delivery"),
      ];

      const result = validateVRPPDRoute(stops);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test("rejects route with multiple violations", () => {
      const stops = [
        createStop("1", "Customer A", "dropoff", "999"), // Missing pickup
        createStop("2", "Customer B", "dropoff", "3"), // Dropoff before pickup
        createStop("3", "Warehouse C", "pickup", "2"),
      ];

      const result = validateVRPPDRoute(stops);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    test("accepts regular route without VRPPD constraints", () => {
      const stops = [
        createStop("1", "Customer A"),
        createStop("2", "Customer B"),
        createStop("3", "Customer C"),
      ];

      const result = validateVRPPDRoute(stops);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe("validatePairingAcrossRoutes", () => {
    test("accepts strict pairs on same route", () => {
      const route1 = [
        createStop("1", "Warehouse A", "pickup", "2"),
        createStop("2", "Customer B", "dropoff", "1"),
      ];
      const routes = [route1];

      const tickets: DeliveryTicket[] = [
        {
          id: "t1",
          pairingMode: "strict",
          pickupStopId: "1",
          dropoffStopId: "2",
          originAddress: "Warehouse A",
          destinationAddress: "Customer B",
          isCompleted: false,
          createdAt: new Date(),
        },
      ];

      const result = validatePairingAcrossRoutes(routes, tickets);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test("rejects strict pairs on different routes", () => {
      const route1 = [createStop("1", "Warehouse A", "pickup", "2")];
      const route2 = [createStop("2", "Customer B", "dropoff", "1")];
      const routes = [route1, route2];

      const tickets: DeliveryTicket[] = [
        {
          id: "t1",
          pairingMode: "strict",
          pickupStopId: "1",
          dropoffStopId: "2",
          ticketNumber: "ENV123",
          originAddress: "Warehouse A",
          destinationAddress: "Customer B",
          isCompleted: false,
          createdAt: new Date(),
        },
      ];

      const result = validatePairingAcrossRoutes(routes, tickets);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe("pairing");
    });

    test("ignores flexible pairing mode", () => {
      const route1 = [createStop("1", "Warehouse A", "pickup", "2")];
      const route2 = [createStop("2", "Customer B", "dropoff", "1")];
      const routes = [route1, route2];

      const tickets: DeliveryTicket[] = [
        {
          id: "t1",
          pairingMode: "flexible", // Should not enforce same-route constraint
          pickupStopId: "1",
          dropoffStopId: "2",
          originAddress: "Warehouse A",
          destinationAddress: "Customer B",
          isCompleted: false,
          createdAt: new Date(),
        },
      ];

      const result = validatePairingAcrossRoutes(routes, tickets);
      expect(result.valid).toBe(true); // Flexible mode allows different routes
      expect(result.violations).toHaveLength(0);
    });

    test("ignores none pairing mode", () => {
      const route1 = [createStop("1", "Customer A", "delivery")];
      const routes = [route1];

      const tickets: DeliveryTicket[] = [
        {
          id: "t1",
          pairingMode: "none",
          originAddress: "Warehouse A",
          destinationAddress: "Customer A",
          isCompleted: false,
          createdAt: new Date(),
        },
      ];

      const result = validatePairingAcrossRoutes(routes, tickets);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test("detects missing pickup in routes", () => {
      const route1 = [createStop("2", "Customer B", "dropoff", "1")];
      const routes = [route1];

      const tickets: DeliveryTicket[] = [
        {
          id: "t1",
          pairingMode: "strict",
          pickupStopId: "999", // Doesn't exist
          dropoffStopId: "2",
          originAddress: "Warehouse A",
          destinationAddress: "Customer B",
          isCompleted: false,
          createdAt: new Date(),
        },
      ];

      const result = validatePairingAcrossRoutes(routes, tickets);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe("getViolationMessages", () => {
    test("returns formatted error messages", () => {
      const violations = checkPrecedence([
        createStop("1", "Customer B", "dropoff", "2"),
        createStop("2", "Warehouse A", "pickup"),
      ]);

      const messages = getViolationMessages(violations);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain("Dropoff stop");
      expect(messages[0]).toContain("must come after pickup");
    });

    test("returns empty array for no violations", () => {
      const messages = getViolationMessages([]);
      expect(messages).toHaveLength(0);
    });
  });

  describe("hasVRPPDConstraints", () => {
    test("returns true for route with pickup stops", () => {
      const stops = [
        createStop("1", "Warehouse A", "pickup"),
        createStop("2", "Customer B", "delivery"),
      ];

      expect(hasVRPPDConstraints(stops)).toBe(true);
    });

    test("returns true for route with dropoff stops", () => {
      const stops = [
        createStop("1", "Customer A", "delivery"),
        createStop("2", "Customer B", "dropoff", "1"),
      ];

      expect(hasVRPPDConstraints(stops)).toBe(true);
    });

    test("returns false for regular delivery route", () => {
      const stops = [createStop("1", "Customer A", "delivery"), createStop("2", "Customer B")];

      expect(hasVRPPDConstraints(stops)).toBe(false);
    });

    test("returns false for empty route", () => {
      expect(hasVRPPDConstraints([])).toBe(false);
    });
  });

  describe("getStopType", () => {
    test("returns specified stop type", () => {
      const stop = createStop("1", "Warehouse A", "pickup");
      expect(getStopType(stop)).toBe("pickup");
    });

    test("defaults to delivery for backward compatibility", () => {
      const stop = createStop("1", "Customer A");
      expect(getStopType(stop)).toBe("delivery");
    });
  });

  describe("getPairingMode", () => {
    test("returns specified pairing mode", () => {
      const ticket: DeliveryTicket = {
        id: "t1",
        pairingMode: "strict",
        originAddress: "A",
        destinationAddress: "B",
        isCompleted: false,
        createdAt: new Date(),
      };
      expect(getPairingMode(ticket)).toBe("strict");
    });

    test("defaults to none for backward compatibility", () => {
      const ticket: DeliveryTicket = {
        id: "t1",
        originAddress: "A",
        destinationAddress: "B",
        isCompleted: false,
        createdAt: new Date(),
      };
      expect(getPairingMode(ticket)).toBe("none");
    });
  });

  describe("Real-world scenarios", () => {
    test("Medical supplies route - strict immediate delivery", () => {
      const stops = [
        createStop("depot", "Hospital Central", "delivery"),
        createStop("p1", "Blood Bank Zona 10", "pickup", "d1"),
        createStop("d1", "Clinic Zona 14", "dropoff", "p1"),
        createStop("p2", "Pharmacy Zona 9", "pickup", "d2"),
        createStop("d2", "Hospital Roosevelt", "dropoff", "p2"),
      ];

      const result = validateVRPPDRoute(stops);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test("E-commerce route - flexible batching", () => {
      const stops = [
        createStop("depot", "Warehouse San Cristóbal", "delivery"),
        createStop("p1", "Seller A Zona 10", "pickup", "d1"),
        createStop("p2", "Seller B Zona 11", "pickup", "d2"),
        createStop("p3", "Seller C Zona 15", "pickup", "d3"),
        createStop("d1", "Buyer A Zona 13", "dropoff", "p1"),
        createStop("d2", "Buyer B Zona 14", "dropoff", "p2"),
        createStop("d3", "Buyer C Zona 16", "dropoff", "p3"),
      ];

      const result = validateVRPPDRoute(stops);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test("Mixed route - strict pairs + flexible deliveries", () => {
      const stops = [
        createStop("depot", "Main Depot", "delivery"),
        createStop("p1", "Medical Supplier", "pickup", "d1"), // Strict
        createStop("r1", "Regular Customer A", "delivery"), // Regular
        createStop("d1", "Hospital", "dropoff", "p1"), // Strict
        createStop("p2", "Warehouse", "pickup", "d2"), // Flexible
        createStop("r2", "Regular Customer B", "delivery"), // Regular
        createStop("d2", "Store", "dropoff", "p2"), // Flexible
      ];

      const result = validateVRPPDRoute(stops);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test("Invalid route - violates precedence", () => {
      const stops = [
        createStop("depot", "Main Depot", "delivery"),
        createStop("d1", "Hospital", "dropoff", "p1"), // WRONG: dropoff first
        createStop("r1", "Regular Customer", "delivery"),
        createStop("p1", "Medical Supplier", "pickup", "d1"), // WRONG: pickup second
      ];

      const result = validateVRPPDRoute(stops);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe("precedence");
    });
  });
});
