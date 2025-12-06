/**
 * Route Planner - Type Definitions
 *
 * Types for route planning, optimization, and template management.
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
  /** Latitude (-90 to 90) */
  lat: number;
  /** Longitude (-180 to 180) */
  lng: number;
}

/**
 * A single stop on the route
 */
export interface RouteStop {
  /** Unique identifier */
  id: string;
  /** Full address string */
  address: string;
  /** Geographic coordinates from geocoding */
  coordinates: Coordinates;
  /** Optional Guatemala zone (e.g., "zona-10") */
  zone?: string;
  /** Optional delivery notes */
  notes?: string;
  /** Order in optimized route (assigned after optimization) */
  sequenceNumber?: number;
}

/**
 * Route configuration settings
 */
export interface RouteConfig {
  /** Starting point (depot/warehouse) */
  startPoint?: RouteStop;
  /** Ending point (if different from start) */
  endPoint?: RouteStop;
  /** Return to start point after completing all stops */
  isRoundTrip: boolean;
  /** Algorithm to use for optimization */
  optimizationMode: OptimizationMode;
  /** Routing mode for distance calculations (defaults to ROAD) */
  routingMode?: RoutingMode;
}

/**
 * Optimization algorithm modes
 */
export enum OptimizationMode {
  /** Simple nearest neighbor - fast, good for MVP */
  NEAREST_NEIGHBOR = "nearest_neighbor",
  /** Future: 2-Opt optimization for better results */
  TWO_OPT = "two_opt",
}

/**
 * Routing mode for distance calculations
 */
export enum RoutingMode {
  /** Use actual road distances via OSRM API */
  ROAD = "road",
  /** Use straight-line distance (Haversine formula) */
  STRAIGHT_LINE = "straight_line",
}

/**
 * Main route object
 */
export interface Route {
  /** Unique identifier */
  id: string;
  /** User-defined route name */
  name: string;
  /** All stops (unordered) */
  stops: RouteStop[];
  /** Route configuration */
  config: RouteConfig;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Optimized route result with comparison metrics
 */
export interface OptimizedRoute {
  /** Reference to original route ID */
  routeId: string;
  /** Stops in optimized order */
  optimizedStops: RouteStop[];
  /** Total distance in kilometers */
  totalDistance: number;
  /** Estimated total time in minutes */
  totalTime: number;
  /** Distance matrix between all stops */
  distanceMatrix: number[][];
  /** Algorithm used for optimization */
  optimizationMode: OptimizationMode;
  /** Routing mode used for distance calculations */
  routingMode: RoutingMode;
  /** Timestamp when optimization was performed */
  optimizedAt: Date;

  /** Distance if visiting in original order (km) */
  originalDistance: number;
  /** Time if visiting in original order (minutes) */
  originalTime: number;
  /** Distance saved by optimization (km) */
  distanceSaved: number;
  /** Time saved by optimization (minutes) */
  timeSaved: number;
  /** Percentage improvement */
  improvementPercent: number;
}

/**
 * Saved route template for recurring deliveries
 */
export interface RouteTemplate {
  /** Unique identifier */
  id: string;
  /** Template name (e.g., "Daily Zone 10 Route") */
  name: string;
  /** Optional description */
  description?: string;
  /** The route configuration */
  route: Route;
  /** Last time this template was used */
  lastUsed?: Date;
  /** Number of times template has been used */
  usageCount: number;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Geocoding result from OpenStreetMap Nominatim API
 */
export interface GeocodingResult {
  /** Formatted address */
  address: string;
  /** Geographic coordinates */
  coordinates: Coordinates;
  /** Full display name from Nominatim */
  displayName: string;
  /** Optional zone extracted from address */
  zone?: string;
}

/**
 * Distance calculation result between two stops
 */
export interface DistanceResult {
  /** Source stop ID */
  fromStopId: string;
  /** Destination stop ID */
  toStopId: string;
  /** Distance in kilometers */
  distance: number;
  /** Estimated duration in minutes */
  duration: number;
}

/**
 * Form data for route builder
 */
export interface RouteFormData {
  /** Start point address */
  startAddress?: string;
  /** End point address */
  endAddress?: string;
  /** Round trip enabled */
  isRoundTrip: boolean;
  /** Current stops being added */
  stops: RouteStop[];
}
