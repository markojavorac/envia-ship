import type { Coordinates } from "@/lib/admin/route-types";
import {
  DriverStatus,
  type TrackedDriver,
  type DriverRoute,
  type RouteStop,
  type MapBounds,
} from "./types";

/**
 * Guatemala City center coordinates
 */
export const GUATEMALA_CITY_CENTER: Coordinates = {
  lat: 14.634915,
  lng: -90.506882,
};

/**
 * Get Guatemala City map bounds
 */
export function getGuatemalaCityBounds(): MapBounds {
  return {
    southwest: { lat: 14.52, lng: -90.58 },
    northeast: { lat: 14.72, lng: -90.42 },
  };
}

/**
 * Generate mock routes for active drivers
 */
function generateMockRoute(
  routeId: string,
  stops: Array<{ address: string; coordinates: Coordinates }>,
  deliveriesToday: number
): DriverRoute {
  const routeStops: RouteStop[] = stops.map((stop, index) => ({
    id: `${routeId}-stop-${index + 1}`,
    address: stop.address,
    coordinates: stop.coordinates,
    isCompleted: index === 0, // First stop already completed
  }));

  return {
    id: routeId,
    stops: routeStops,
    currentStopIndex: 0, // Currently between stop 0 and stop 1
    stopsCompleted: 1,
    deliveriesToday,
  };
}

/**
 * Generate 3-4 mock drivers with realistic Guatemala City locations
 */
export function generateMockDrivers(): TrackedDriver[] {
  const now = new Date();

  return [
    // Driver 1: Active in Zona 10 area (heading to Zona 9)
    {
      id: "driver-001",
      name: "Carlos Méndez",
      status: DriverStatus.ACTIVE,
      position: { lat: 14.5995, lng: -90.5155 }, // Starting position in Zona 10
      lastUpdated: now,
      route: generateMockRoute(
        "route-001",
        [
          {
            address: "12 Calle 1-25, Zona 10",
            coordinates: { lat: 14.5995, lng: -90.5155 },
          },
          {
            address: "7a Avenida 15-45, Zona 9",
            coordinates: { lat: 14.6025, lng: -90.5125 },
          },
          {
            address: "Avenida Las Américas 9-08, Zona 13",
            coordinates: { lat: 14.5832, lng: -90.5275 },
          },
          {
            address: "Calzada Roosevelt 22-43, Zona 11",
            coordinates: { lat: 14.6185, lng: -90.5395 },
          },
        ],
        5
      ),
    },

    // Driver 2: Active in Zona 1 area (heading to Zona 4)
    {
      id: "driver-002",
      name: "Ana López",
      status: DriverStatus.ACTIVE,
      position: { lat: 14.6285, lng: -90.5125 }, // Starting position in Zona 1
      lastUpdated: now,
      route: generateMockRoute(
        "route-002",
        [
          {
            address: "5a Avenida 8-32, Zona 1",
            coordinates: { lat: 14.6285, lng: -90.5125 },
          },
          {
            address: "Boulevard Liberación 12-70, Zona 4",
            coordinates: { lat: 14.6195, lng: -90.4985 },
          },
          {
            address: "6a Calle 5-33, Zona 5",
            coordinates: { lat: 14.6385, lng: -90.5215 },
          },
          {
            address: "Calzada San Juan 18-62, Zona 7",
            coordinates: { lat: 14.6455, lng: -90.5485 },
          },
        ],
        7
      ),
    },

    // Driver 3: Available (idle at last delivery in Zona 12)
    {
      id: "driver-003",
      name: "Roberto García",
      status: DriverStatus.AVAILABLE,
      position: { lat: 14.5765, lng: -90.5025 }, // Zona 12
      lastUpdated: now,
      // No route - driver is available
    },

    // Driver 4: Offline (last known position in Zona 15)
    {
      id: "driver-004",
      name: "María Santos",
      status: DriverStatus.OFFLINE,
      position: { lat: 14.6142, lng: -90.5485 }, // Zona 15
      lastUpdated: now,
      // No route - driver is offline
    },
  ];
}

/**
 * Get color for driver status
 */
export function getDriverColor(status: DriverStatus): string {
  switch (status) {
    case DriverStatus.ACTIVE:
      return "#22c55e"; // green-500
    case DriverStatus.AVAILABLE:
      return "#FF8C00"; // primary orange
    case DriverStatus.OFFLINE:
      return "#94a3b8"; // slate-400
  }
}

/**
 * Get status badge class name
 */
export function getStatusBadgeClass(status: DriverStatus): string {
  switch (status) {
    case DriverStatus.ACTIVE:
      return "bg-green-500/20 text-green-500 border-green-500";
    case DriverStatus.AVAILABLE:
      return "bg-primary/20 text-primary border-primary";
    case DriverStatus.OFFLINE:
      return "bg-muted text-muted-foreground border-muted-foreground";
  }
}
