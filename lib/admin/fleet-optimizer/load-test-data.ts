/**
 * Load Test Data Generator
 *
 * Generates realistic fleet and stop data for simulation testing.
 */

import type { RouteStop } from "../route-types";
import type { FleetConfig, Vehicle } from "../fleet-types";
import { VEHICLE_TYPE_PRESETS } from "./vehicle-presets";

/**
 * Guatemala City bounds for realistic coordinates
 */
const GUATEMALA_CITY_BOUNDS = {
  minLat: 14.55,
  maxLat: 14.65,
  minLng: -90.55,
  maxLng: -90.45,
};

/**
 * Guatemala City zones
 */
const ZONES = ["1", "4", "7", "9", "10", "11", "12", "13", "15", "16"];

/**
 * Sample street names for Guatemala City
 */
const STREET_NAMES = [
  "Avenida Reforma",
  "Calle Montúfar",
  "Boulevard Los Próceres",
  "Avenida Las Américas",
  "Calzada Roosevelt",
  "Boulevard Liberación",
  "Calzada San Juan",
  "Avenida Petapa",
  "Diagonal 6",
  "Calzada Atanasio Tzul",
];

/**
 * Sample business types
 */
const BUSINESS_TYPES = [
  "Oficina",
  "Residencia",
  "Tienda",
  "Restaurante",
  "Centro Comercial",
  "Bodega",
  "Hospital",
  "Escuela",
  "Hotel",
  "Farmacia",
];

/**
 * Generate random coordinate within Guatemala City bounds
 */
function generateRandomCoordinate() {
  const lat =
    GUATEMALA_CITY_BOUNDS.minLat +
    Math.random() * (GUATEMALA_CITY_BOUNDS.maxLat - GUATEMALA_CITY_BOUNDS.minLat);
  const lng =
    GUATEMALA_CITY_BOUNDS.minLng +
    Math.random() * (GUATEMALA_CITY_BOUNDS.maxLng - GUATEMALA_CITY_BOUNDS.minLng);

  return { lat, lng };
}

/**
 * Generate random zone
 */
function generateRandomZone(): string {
  return ZONES[Math.floor(Math.random() * ZONES.length)];
}

/**
 * Generate realistic address
 */
function generateAddress(): string {
  const streetNumber = Math.floor(Math.random() * 50) + 1;
  const buildingNumber = Math.floor(Math.random() * 200) + 1;
  const street = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
  const zone = generateRandomZone();

  return `${streetNumber}-${buildingNumber} ${street}, Zona ${zone}`;
}

/**
 * Generate realistic notes
 */
function generateNotes(): string | undefined {
  const businessType = BUSINESS_TYPES[Math.floor(Math.random() * BUSINESS_TYPES.length)];
  const noteTemplates = [
    `${businessType} - Entregar en recepción`,
    `${businessType} - Piso ${Math.floor(Math.random() * 10) + 1}`,
    `${businessType} - Tocar timbre`,
    undefined, // 25% chance of no notes
  ];

  return noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
}

/**
 * Generate N stops within Guatemala City bounds
 * Realistic zones, addresses, package counts
 */
export function generateLoadTestStops(count: number): RouteStop[] {
  const stops: RouteStop[] = [];

  for (let i = 0; i < count; i++) {
    const coordinates = generateRandomCoordinate();
    const zone = generateRandomZone();

    stops.push({
      id: `stop-${i + 1}`,
      address: generateAddress(),
      coordinates,
      zone,
      notes: generateNotes(),
      packageCount: Math.floor(Math.random() * 6) + 3, // 3-8 packages per stop (realistic e-commerce density)
    });
  }

  return stops;
}

/**
 * Generate fleet based on scale
 * small: 5 vehicles (2 motorcycles, 2 vans, 1 truck), 20 stops
 * medium: 7 vehicles, 35 stops
 * large: 10 vehicles, 50 stops
 */
export function generateLoadTestFleet(
  scale: "small" | "medium" | "large",
  depot: RouteStop
): FleetConfig {
  const vehicles: Vehicle[] = [];
  let vehicleId = 1;

  const configs = {
    small: { motorcycles: 2, vans: 2, trucks: 1 },
    medium: { motorcycles: 3, vans: 3, trucks: 1 },
    large: { motorcycles: 4, vans: 4, trucks: 2 },
  };

  const config = configs[scale];

  // Generate motorcycles
  for (let i = 0; i < config.motorcycles; i++) {
    vehicles.push({
      id: `vehicle-${vehicleId}`,
      vehicleTypeId: "motorcycle",
      label: `Moto ${i + 1}`,
      packageCapacity: VEHICLE_TYPE_PRESETS.motorcycle.capacity,
      color: VEHICLE_TYPE_PRESETS.motorcycle.color,
    });
    vehicleId++;
  }

  // Generate vans
  for (let i = 0; i < config.vans; i++) {
    vehicles.push({
      id: `vehicle-${vehicleId}`,
      vehicleTypeId: "van",
      label: `Van ${i + 1}`,
      packageCapacity: VEHICLE_TYPE_PRESETS.van.capacity,
      color: VEHICLE_TYPE_PRESETS.van.color,
    });
    vehicleId++;
  }

  // Generate trucks
  for (let i = 0; i < config.trucks; i++) {
    vehicles.push({
      id: `vehicle-${vehicleId}`,
      vehicleTypeId: "truck",
      label: `Camión ${i + 1}`,
      packageCapacity: VEHICLE_TYPE_PRESETS.truck.capacity,
      color: VEHICLE_TYPE_PRESETS.truck.color,
    });
    vehicleId++;
  }

  return {
    vehicles,
    depot,
    returnToDepot: true,
  };
}

/**
 * Generate single random ticket for simulation
 */
export function generateRandomTicket(): RouteStop {
  const coordinates = generateRandomCoordinate();
  const zone = generateRandomZone();

  return {
    id: `ticket-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    address: generateAddress(),
    coordinates,
    zone,
    notes: generateNotes(),
    packageCount: Math.floor(Math.random() * 3) + 1, // 1-3 packages
  };
}
