import { DispatchEntry, DispatchStatus, DispatchPriority } from "./dispatch-types";
import { GUATEMALA_ZONES } from "@/lib/types";

/**
 * Mock Dispatch Data Generator
 *
 * Generates realistic dispatch entries for the terminal board demo.
 * Follows the pattern established in mock-orders.ts with weighted distributions.
 */

// Driver name pools (Guatemalan names)
const DRIVER_FIRST_NAMES = [
  "Carlos",
  "Miguel",
  "José",
  "Luis",
  "Diego",
  "Juan",
  "Pedro",
  "Fernando",
  "Ricardo",
  "Alejandro",
  "Roberto",
  "Manuel",
  "Francisco",
  "Jorge",
  "Raúl",
  "Sergio",
  "Mario",
  "Daniel",
  "Eduardo",
  "Gabriel",
];

const DRIVER_LAST_NAMES = [
  "Mendoza",
  "García",
  "López",
  "Ramírez",
  "Torres",
  "Flores",
  "Gómez",
  "Martínez",
  "Rodríguez",
  "Pérez",
  "González",
  "Sánchez",
  "Hernández",
  "Cruz",
  "Morales",
  "Díaz",
  "Jiménez",
  "Ruiz",
  "Alvarez",
  "Castillo",
];

// Vehicle type configuration
const VEHICLE_TYPES = {
  VAN: { prefix: "VAN", start: 301, count: 20 }, // VAN-301 to VAN-320
  TRUCK: { prefix: "TRUCK", start: 101, count: 10 }, // TRUCK-101 to TRUCK-110
} as const;

/**
 * Get random element from array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random integer between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random date/time within a range
 */
function getRandomDate(minutesAgo: number, minutesFromNow: number = 0): Date {
  const now = Date.now();
  const start = now - minutesAgo * 60 * 1000;
  const end = now + minutesFromNow * 60 * 1000;
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

/**
 * Generate random driver name
 */
function generateDriverName(): string {
  const firstName = getRandomElement(DRIVER_FIRST_NAMES);
  const lastName = getRandomElement(DRIVER_LAST_NAMES);
  return `${firstName} ${lastName}`;
}

/**
 * Generate vehicle ID
 * 70% vans, 30% trucks (vans are more common for last-mile delivery)
 */
function generateVehicleId(): string {
  const useVan = Math.random() < 0.7;

  if (useVan) {
    const num = getRandomInt(
      VEHICLE_TYPES.VAN.start,
      VEHICLE_TYPES.VAN.start + VEHICLE_TYPES.VAN.count - 1
    );
    return `${VEHICLE_TYPES.VAN.prefix}-${num}`;
  } else {
    const num = getRandomInt(
      VEHICLE_TYPES.TRUCK.start,
      VEHICLE_TYPES.TRUCK.start + VEHICLE_TYPES.TRUCK.count - 1
    );
    return `${VEHICLE_TYPES.TRUCK.prefix}-${num}`;
  }
}

/**
 * Get weighted zone (popular zones are more likely)
 * Zona 1, 4, 9, 10 are weighted more heavily
 */
function getWeightedZone(): { value: string; label: string } {
  const popularZones = ["zona-1", "zona-4", "zona-9", "zona-10"];
  const isPopularZone = Math.random() < 0.6; // 60% chance of popular zone
  const zones = [...GUATEMALA_ZONES]; // Create mutable copy

  if (isPopularZone) {
    const zoneValue = getRandomElement(popularZones);
    const zone = zones.find((z) => z.value === zoneValue);
    return zone || getRandomElement(zones);
  }

  return getRandomElement(zones);
}

/**
 * Generate random shipment ID
 */
function generateShipmentId(): string {
  return `SHP-${String(getRandomInt(1000, 9999))}`;
}

/**
 * Get weighted status based on realistic distribution
 * 50% WAITING (most drivers waiting), 12.5% LOADING (only 1 at a time ideally),
 * 25% READY (loaded, ready to go), 12.5% DEPARTED
 */
function getWeightedStatus(): DispatchStatus {
  const rand = Math.random();

  if (rand < 0.5) return DispatchStatus.WAITING; // 50%
  if (rand < 0.625) return DispatchStatus.LOADING; // 12.5%
  if (rand < 0.875) return DispatchStatus.READY; // 25%
  return DispatchStatus.DEPARTED; // 12.5%
}

/**
 * Get priority (10% urgent, 90% normal)
 */
function getWeightedPriority(): DispatchPriority {
  return Math.random() < 0.1 ? "urgent" : "normal";
}

/**
 * Generate package count based on vehicle type and zone
 */
function generatePackageCount(vehicleId: string): number {
  const isTruck = vehicleId.startsWith("TRUCK");

  if (isTruck) {
    // Trucks carry more packages (15-30)
    return getRandomInt(15, 30);
  } else {
    // Vans carry fewer packages (5-20)
    return getRandomInt(5, 20);
  }
}

/**
 * Generate loaded package count based on status
 */
function generateLoadedCount(status: DispatchStatus, totalPackages: number): number {
  switch (status) {
    case DispatchStatus.WAITING:
      return 0; // Haven't started loading

    case DispatchStatus.LOADING:
      // Between 1 and totalPackages - 1 (partially loaded)
      return getRandomInt(1, Math.max(1, totalPackages - 1));

    case DispatchStatus.READY:
    case DispatchStatus.DEPARTED:
      return totalPackages; // Fully loaded

    default:
      return 0;
  }
}

/**
 * Generate dispatch entry with realistic data
 */
function generateDispatchEntry(index: number): DispatchEntry {
  const status = getWeightedStatus();
  const vehicleId = generateVehicleId();
  const packageCount = generatePackageCount(vehicleId);
  const loadedPackages = generateLoadedCount(status, packageCount);
  const zone = getWeightedZone();
  const priority = getWeightedPriority();

  // Time calculations based on status
  let assignedAt: Date;
  let estimatedDeparture: Date;
  let actualDeparture: Date | undefined;

  const now = new Date();

  switch (status) {
    case DispatchStatus.WAITING:
      // Assigned 1-5 minutes ago
      assignedAt = getRandomDate(5, 0);
      // Estimated departure 10-20 minutes from now
      estimatedDeparture = getRandomDate(0, getRandomInt(10, 20));
      break;

    case DispatchStatus.LOADING:
      // Assigned 5-15 minutes ago
      assignedAt = getRandomDate(15, 0);
      // Estimated departure 5-15 minutes from now
      estimatedDeparture = getRandomDate(0, getRandomInt(5, 15));
      break;

    case DispatchStatus.READY:
      // Assigned 10-20 minutes ago
      assignedAt = getRandomDate(20, 0);
      // Estimated departure ASAP (within next 5 minutes)
      estimatedDeparture = getRandomDate(0, getRandomInt(1, 5));
      break;

    case DispatchStatus.DEPARTED:
      // Assigned 20-60 minutes ago
      assignedAt = getRandomDate(60, 0);
      // Already departed (1-30 minutes ago)
      actualDeparture = getRandomDate(30, 0);
      // Estimated was before actual
      estimatedDeparture = new Date(actualDeparture.getTime() - getRandomInt(1, 5) * 60 * 1000);
      break;

    default:
      assignedAt = now;
      estimatedDeparture = now;
  }

  return {
    id: `DRV-${String(index + 1).padStart(3, "0")}`,
    shipmentId: generateShipmentId(),
    driverName: generateDriverName(),
    vehicleId,
    deliveryZone: zone.value,
    deliveryZoneLabel: zone.label,
    packageCount,
    loadedPackages,
    status,
    estimatedDeparture,
    actualDeparture,
    assignedAt,
    priority,
  };
}

/**
 * Generate array of mock dispatch entries
 *
 * @param count Number of entries to generate (default: 18)
 * @returns Array of DispatchEntry objects with realistic distribution
 */
export function generateMockDispatch(count: number = 18): DispatchEntry[] {
  return Array.from({ length: count }, (_, index) => generateDispatchEntry(index));
}
