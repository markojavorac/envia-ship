import type { Coordinates } from "@/lib/admin/route-types";

/**
 * Driver status states
 */
export enum DriverStatus {
  ACTIVE = "active",
  AVAILABLE = "available",
  OFFLINE = "offline",
}

/**
 * Driver tracking data
 */
export interface TrackedDriver {
  /** Unique driver ID */
  id: string;
  /** Driver name */
  name: string;
  /** Current status */
  status: DriverStatus;
  /** Current position */
  position: Coordinates;
  /** Optional route (only for active drivers) */
  route?: DriverRoute;
  /** Last position update timestamp */
  lastUpdated: Date;
}

/**
 * Driver route with stops
 */
export interface DriverRoute {
  /** Route ID */
  id: string;
  /** Array of delivery stops */
  stops: RouteStop[];
  /** Current stop index (0-based) */
  currentStopIndex: number;
  /** Total stops completed */
  stopsCompleted: number;
  /** Total deliveries completed today */
  deliveriesToday: number;
}

/**
 * Route stop (simplified for tracking)
 */
export interface RouteStop {
  /** Stop ID */
  id: string;
  /** Delivery address */
  address: string;
  /** Stop coordinates */
  coordinates: Coordinates;
  /** Completed flag */
  isCompleted: boolean;
}

/**
 * Map viewport bounds
 */
export interface MapBounds {
  /** Southwest corner */
  southwest: Coordinates;
  /** Northeast corner */
  northeast: Coordinates;
}

/**
 * Map filters state
 */
export interface MapFilters {
  /** Show active drivers */
  showActive: boolean;
  /** Show available drivers */
  showAvailable: boolean;
  /** Show offline drivers */
  showOffline: boolean;
}

/**
 * Simulation state
 */
export interface SimulationState {
  /** Is simulation running */
  isRunning: boolean;
  /** Update interval in milliseconds */
  updateInterval: number;
  /** Movement speed multiplier */
  speedMultiplier: number;
}

/**
 * Driver tracking stats
 */
export interface DriverStats {
  /** Count of active drivers */
  activeCount: number;
  /** Count of available drivers */
  availableCount: number;
  /** Count of offline drivers */
  offlineCount: number;
  /** Total deliveries completed today across all drivers */
  totalDeliveriesToday: number;
}
