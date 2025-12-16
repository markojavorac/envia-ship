/**
 * Vehicle Presets
 *
 * Default vehicle types and factory functions for fleet optimization.
 */

import type { VehicleType, Vehicle } from "../fleet-types";

/**
 * Default vehicle type presets
 */
export const VEHICLE_TYPE_PRESETS: Record<string, VehicleType> = {
  motorcycle: {
    id: "motorcycle",
    name: "Motorcycle",
    packageCapacity: 5,
    color: "#FF8C00", // Orange (primary brand color)
    icon: "bike",
  },
  van: {
    id: "van",
    name: "Van",
    packageCapacity: 20,
    color: "#3B82F6", // Blue
    icon: "truck",
  },
  truck: {
    id: "truck",
    name: "Truck",
    packageCapacity: 50,
    color: "#10B981", // Green
    icon: "truck",
  },
} as const;

/**
 * Array of vehicle types for easy iteration
 */
export const VEHICLE_TYPES = Object.values(VEHICLE_TYPE_PRESETS);

/**
 * Create a vehicle instance from a vehicle type
 *
 * @param typeId - Vehicle type ID
 * @param label - Custom label for this vehicle (e.g., "Vehicle 1", "Truck A")
 * @returns Vehicle instance
 */
export function createVehicle(typeId: string, label: string): Vehicle {
  const type = VEHICLE_TYPE_PRESETS[typeId];

  if (!type) {
    throw new Error(`Unknown vehicle type: ${typeId}`);
  }

  return {
    id: `vehicle-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    vehicleTypeId: type.id,
    label,
    packageCapacity: type.packageCapacity,
    color: type.color,
    currentPackageCount: 0,
  };
}

/**
 * Create a fleet of vehicles
 *
 * @param config - Array of {typeId, count} objects
 * @returns Array of vehicle instances
 *
 * @example
 * ```typescript
 * const fleet = createFleet([
 *   { typeId: "van", count: 2 },
 *   { typeId: "truck", count: 1 }
 * ]);
 * // Returns: [Van 1, Van 2, Truck 1]
 * ```
 */
export function createFleet(
  config: Array<{ typeId: string; count: number }>
): Vehicle[] {
  const vehicles: Vehicle[] = [];

  for (const { typeId, count } of config) {
    const typeName = VEHICLE_TYPE_PRESETS[typeId]?.name ?? "Vehicle";

    for (let i = 1; i <= count; i++) {
      vehicles.push(createVehicle(typeId, `${typeName} ${i}`));
    }
  }

  return vehicles;
}

/**
 * Get vehicle type by ID
 */
export function getVehicleType(typeId: string): VehicleType | undefined {
  return VEHICLE_TYPE_PRESETS[typeId];
}

/**
 * Get total fleet capacity
 */
export function getTotalFleetCapacity(vehicles: Vehicle[]): number {
  return vehicles.reduce((sum, v) => sum + v.packageCapacity, 0);
}

/**
 * Get vehicle colors for visualization
 */
export const VEHICLE_COLORS = {
  motorcycle: "#FF8C00",
  van: "#3B82F6",
  truck: "#10B981",
} as const;
