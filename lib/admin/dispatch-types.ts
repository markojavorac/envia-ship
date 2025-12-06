/**
 * Dispatch Terminal - Type Definitions
 *
 * Types for the dispatch terminal board showing real-time driver status,
 * package loading progress, and delivery assignments.
 */

/**
 * Driver/Shipment Status
 * Represents the current state of a driver's dispatch assignment
 */
export enum DispatchStatus {
  WAITING = "waiting", // Driver assigned, waiting for packages
  LOADING = "loading", // Actively loading packages
  READY = "ready", // Fully loaded, ready to depart
  DEPARTED = "departed", // Already left the hub
}

/**
 * Priority level for dispatch entries
 */
export type DispatchPriority = "normal" | "urgent";

/**
 * Main dispatch entry representing a driver's current assignment
 */
export interface DispatchEntry {
  /** Unique identifier (e.g., DRV-001, DRV-002) */
  id: string;

  /** Shipment identifier (e.g., SHP-1234) */
  shipmentId: string;

  /** Driver's full name (e.g., "Carlos Mendoza") */
  driverName: string;

  /** Vehicle identifier (e.g., "VAN-312", "TRUCK-105") */
  vehicleId: string;

  /** Delivery zone ID (e.g., "zona-10") */
  deliveryZone: string;

  /** Human-readable zone label (e.g., "Zona 10 - Business District") */
  deliveryZoneLabel: string;

  /** Total number of packages to load */
  packageCount: number;

  /** Number of packages currently loaded */
  loadedPackages: number;

  /** Current dispatch status */
  status: DispatchStatus;

  /** Scheduled departure time */
  estimatedDeparture: Date;

  /** Actual departure time (only set when status = DEPARTED) */
  actualDeparture?: Date;

  /** When the driver was assigned this route */
  assignedAt: Date;

  /** Priority level (affects visual display) */
  priority: DispatchPriority;
}
