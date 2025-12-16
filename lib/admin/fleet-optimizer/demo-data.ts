/**
 * Fleet Optimizer Demo Data
 *
 * Realistic Guatemala City delivery stops across multiple zones
 * for testing and demonstration of fleet optimization.
 */

import type { RouteStop } from "../route-types";

/**
 * Demo delivery stops across Guatemala City zones
 * Includes variety of package counts and geographic distribution
 */
export const DEMO_FLEET_STOPS: RouteStop[] = [
  // Zona 10 - Business district
  {
    id: "demo-1",
    address: "Avenida Las Américas 9-08, Zona 13, Guatemala City",
    coordinates: { lat: 14.5832, lng: -90.5275 },
    zone: "zona-13",
    packageCount: 2,
    notes: "Office building - 2nd floor",
  },
  {
    id: "demo-2",
    address: "6a Avenida 14-25, Zona 10, Guatemala City",
    coordinates: { lat: 14.5995, lng: -90.5155 },
    zone: "zona-10",
    packageCount: 1,
    notes: "Reception desk",
  },
  {
    id: "demo-3",
    address: "Boulevard Los Próceres 24-69, Zona 10, Guatemala City",
    coordinates: { lat: 14.5891, lng: -90.5236 },
    zone: "zona-10",
    packageCount: 3,
    notes: "Corporate headquarters",
  },

  // Zona 1 - Historic center
  {
    id: "demo-4",
    address: "6a Avenida 11-28, Zona 1, Guatemala City",
    coordinates: { lat: 14.6423, lng: -90.5134 },
    zone: "zona-1",
    packageCount: 1,
    notes: "Historic building",
  },
  {
    id: "demo-5",
    address: "12 Calle 5-12, Zona 1, Guatemala City",
    coordinates: { lat: 14.6389, lng: -90.5098 },
    zone: "zona-1",
    packageCount: 2,
    notes: "Ground floor shop",
  },

  // Zona 4 - Mixed residential/commercial
  {
    id: "demo-6",
    address: "Calzada Roosevelt 23-40, Zona 11, Guatemala City",
    coordinates: { lat: 14.6156, lng: -90.5589 },
    zone: "zona-11",
    packageCount: 1,
    notes: "Shopping center",
  },
  {
    id: "demo-7",
    address: "15 Avenida 19-60, Zona 13, Guatemala City",
    coordinates: { lat: 14.5723, lng: -90.5342 },
    zone: "zona-13",
    packageCount: 4,
    notes: "Warehouse - loading dock",
  },

  // Zona 9 - Residential
  {
    id: "demo-8",
    address: "4a Avenida 15-45, Zona 9, Guatemala City",
    coordinates: { lat: 14.5889, lng: -90.5087 },
    zone: "zona-9",
    packageCount: 1,
    notes: "Apartment 301",
  },
  {
    id: "demo-9",
    address: "11 Calle 3-80, Zona 9, Guatemala City",
    coordinates: { lat: 14.5934, lng: -90.5123 },
    zone: "zona-9",
    packageCount: 2,
    notes: "Residential building",
  },

  // Zona 14 - Upscale residential
  {
    id: "demo-10",
    address: "Avenida La Reforma 8-60, Zona 9, Guatemala City",
    coordinates: { lat: 14.5978, lng: -90.5145 },
    zone: "zona-9",
    packageCount: 1,
    notes: "High-rise apartment",
  },
  {
    id: "demo-11",
    address: "20 Calle 10-17, Zona 10, Guatemala City",
    coordinates: { lat: 14.5956, lng: -90.5189 },
    zone: "zona-10",
    packageCount: 3,
    notes: "Condominium tower",
  },

  // Zona 15 - Vista Hermosa
  {
    id: "demo-12",
    address: "Vista Hermosa I, 15 Avenida 10-35, Zona 15, Guatemala City",
    coordinates: { lat: 14.6089, lng: -90.4923 },
    zone: "zona-15",
    packageCount: 2,
    notes: "Private residence",
  },

  // Zona 11 - Las Charcas
  {
    id: "demo-13",
    address: "Calzada San Juan 45-12, Zona 7, Guatemala City",
    coordinates: { lat: 14.6234, lng: -90.5423 },
    zone: "zona-7",
    packageCount: 1,
    notes: "Commercial plaza",
  },

  // Zona 12 - Residential
  {
    id: "demo-14",
    address: "3a Calle 8-55, Zona 12, Guatemala City",
    coordinates: { lat: 14.5734, lng: -90.5567 },
    zone: "zona-12",
    packageCount: 2,
    notes: "Family home",
  },

  // Zona 16 - Carretera a El Salvador
  {
    id: "demo-15",
    address: "Calzada Atanasio Tzul 21-81, Zona 12, Guatemala City",
    coordinates: { lat: 14.5689, lng: -90.5489 },
    zone: "zona-12",
    packageCount: 1,
    notes: "Industrial park",
  },

  // Additional mixed zones for better distribution
  {
    id: "demo-16",
    address: "6a Avenida 4-32, Zona 4, Guatemala City",
    coordinates: { lat: 14.6267, lng: -90.5178 },
    zone: "zona-4",
    packageCount: 3,
    notes: "Medical clinic",
  },
  {
    id: "demo-17",
    address: "Diagonal 6 10-01, Zona 10, Guatemala City",
    coordinates: { lat: 14.5923, lng: -90.5201 },
    zone: "zona-10",
    packageCount: 2,
    notes: "Restaurant",
  },
  {
    id: "demo-18",
    address: "18 Calle 24-69, Zona 11, Guatemala City",
    coordinates: { lat: 14.6123, lng: -90.5612 },
    zone: "zona-11",
    packageCount: 1,
    notes: "Pharmacy",
  },
];

/**
 * Get a random subset of demo stops for variety
 *
 * @param count - Number of stops to return (default: all)
 * @returns Array of demo stops
 */
export function getDemoStops(count?: number): RouteStop[] {
  if (!count || count >= DEMO_FLEET_STOPS.length) {
    return [...DEMO_FLEET_STOPS];
  }

  // Shuffle and take first N
  const shuffled = [...DEMO_FLEET_STOPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get demo stops for a specific scenario
 */
export function getDemoScenario(scenario: "small" | "medium" | "large"): RouteStop[] {
  switch (scenario) {
    case "small":
      return getDemoStops(8); // 8 stops - good for 2 vehicles
    case "medium":
      return getDemoStops(15); // 15 stops - good for 3 vehicles
    case "large":
      return DEMO_FLEET_STOPS; // All 18 stops - stress test
    default:
      return getDemoStops(12);
  }
}
