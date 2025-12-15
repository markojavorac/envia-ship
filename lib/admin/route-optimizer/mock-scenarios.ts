/**
 * Mock Scenarios for Route Optimizer Visualizer
 *
 * 6 diverse test cases showcasing different optimization situations:
 * 1. The Zigzag - Dramatic cross-zone chaos
 * 2. The Same-Zone Cluster - All in business district
 * 3. The Long Haul - Mix of nearby + distant stops
 * 4. The Small Route - Just a few deliveries
 * 5. The Big Day - Full driver load
 * 6. The Zone Pairs - Common business pattern
 */

export interface MockRouteStop {
  address: string;
  coordinates: { lat: number; lng: number };
  zone: string;
  recipientName?: string;
  notes?: string;
}

export interface MockScenario {
  id: string;
  name: string;
  description: string;
  stopCount: number;
  stops: MockRouteStop[];
  expectedSavings: {
    distanceKm: number;
    timeMin: number;
    fuelCostGTQ: number;
    co2Kg: number;
    improvementPercent: number;
  };
}

/**
 * Scenario 1: "The Zigzag" - Cross-Zone Chaos
 * Most dramatic visual improvement
 */
const zigzagScenario: MockScenario = {
  id: "zigzag",
  name: "The Zigzag",
  description: "Addresses entered randomly across zones - driver crosses same zones multiple times",
  stopCount: 6,
  stops: [
    {
      address: "6a Avenida 13-42, Zona 1, Guatemala City",
      coordinates: { lat: 14.634915, lng: -90.516882 },
      zone: "Zona 1",
      recipientName: "María López",
      notes: "Centro Histórico delivery",
    },
    {
      address: "Boulevard Los Próceres 24-69, Zona 10, Guatemala City",
      coordinates: { lat: 14.601528, lng: -90.524861 },
      zone: "Zona 10",
      recipientName: "Carlos Méndez",
      notes: "Business district office",
    },
    {
      address: "Ruta 6 8-34, Zona 4, Guatemala City",
      coordinates: { lat: 14.620000, lng: -90.502500 },
      zone: "Zona 4",
      recipientName: "Ana García",
      notes: "Residential area",
    },
    {
      address: "Calzada Roosevelt 22-43, Zona 9, Guatemala City",
      coordinates: { lat: 14.608333, lng: -90.523056 },
      zone: "Zona 9",
      recipientName: "Roberto Pérez",
      notes: "Near shopping center",
    },
    {
      address: "11 Calle 5-12, Zona 1, Guatemala City",
      coordinates: { lat: 14.638194, lng: -90.512778 },
      zone: "Zona 1",
      recipientName: "Lucía Ramírez",
      notes: "Historic center",
    },
    {
      address: "7a Avenida 18-33, Zona 7, Guatemala City",
      coordinates: { lat: 14.625833, lng: -90.556944 },
      zone: "Zona 7",
      recipientName: "Jorge Hernández",
      notes: "West side delivery",
    },
  ],
  expectedSavings: {
    distanceKm: 16,
    timeMin: 27,
    fuelCostGTQ: 120,
    co2Kg: 3.7,
    improvementPercent: 35,
  },
};

/**
 * Scenario 2: "The Same-Zone Cluster" - All Zona 10
 * Shows optimization works even in small areas
 */
const sameZoneClusterScenario: MockScenario = {
  id: "same-zone-cluster",
  name: "The Same-Zone Cluster",
  description: "All deliveries in business district (Zona 10) - scattered order within zone",
  stopCount: 8,
  stops: [
    {
      address: "Diagonal 6 14-01, Zona 10, Guatemala City",
      coordinates: { lat: 14.598611, lng: -90.521389 },
      zone: "Zona 10",
      recipientName: "Patricia Morales",
      notes: "Office building",
    },
    {
      address: "4a Avenida 16-62, Zona 10, Guatemala City",
      coordinates: { lat: 14.594722, lng: -90.515278 },
      zone: "Zona 10",
      recipientName: "Fernando Silva",
      notes: "High-rise apartment",
    },
    {
      address: "12 Calle 1-25, Zona 10, Guatemala City",
      coordinates: { lat: 14.603889, lng: -90.518056 },
      zone: "Zona 10",
      recipientName: "Mónica Cruz",
      notes: "Medical clinic",
    },
    {
      address: "Boulevard Los Próceres 24-43, Zona 10, Guatemala City",
      coordinates: { lat: 14.601250, lng: -90.524306 },
      zone: "Zona 10",
      recipientName: "Alejandro Torres",
      notes: "Bank headquarters",
    },
    {
      address: "7a Avenida 5-10, Zona 10, Guatemala City",
      coordinates: { lat: 14.606944, lng: -90.520833 },
      zone: "Zona 10",
      recipientName: "Gabriela Ortiz",
      notes: "Hotel reception",
    },
    {
      address: "13 Calle 8-44, Zona 10, Guatemala City",
      coordinates: { lat: 14.602222, lng: -90.516111 },
      zone: "Zona 10",
      recipientName: "Diego Vargas",
      notes: "Law firm",
    },
    {
      address: "5a Avenida 12-31, Zona 10, Guatemala City",
      coordinates: { lat: 14.600556, lng: -90.519444 },
      zone: "Zona 10",
      recipientName: "Valeria Castillo",
      notes: "Dental office",
    },
    {
      address: "Diagonal 10 15-47, Zona 10, Guatemala City",
      coordinates: { lat: 14.596389, lng: -90.522778 },
      zone: "Zona 10",
      recipientName: "Ricardo Gómez",
      notes: "Corporate office",
    },
  ],
  expectedSavings: {
    distanceKm: 3.2,
    timeMin: 12,
    fuelCostGTQ: 45,
    co2Kg: 0.7,
    improvementPercent: 15,
  },
};

/**
 * Scenario 3: "The Long Haul" - Zona 1 to Zona 16
 * Highway efficiency matters
 */
const longHaulScenario: MockScenario = {
  id: "long-haul",
  name: "The Long Haul",
  description: "Mix of nearby + distant stops - inefficient back-and-forth wastes highway time",
  stopCount: 4,
  stops: [
    {
      address: "8a Avenida 15-62, Zona 1, Guatemala City",
      coordinates: { lat: 14.633056, lng: -90.514722 },
      zone: "Zona 1",
      recipientName: "Elena Fuentes",
      notes: "Downtown office",
    },
    {
      address: "Calzada San Juan 45-12, Zona 7, Guatemala City",
      coordinates: { lat: 14.620000, lng: -90.560000 },
      zone: "Zona 7",
      recipientName: "Pablo Rojas",
      notes: "West residential",
    },
    {
      address: "Carretera a El Salvador Km 10, Zona 16, Guatemala City",
      coordinates: { lat: 14.530000, lng: -90.480000 },
      zone: "Zona 16",
      recipientName: "Sandra Vega",
      notes: "Far south industrial area",
    },
    {
      address: "3a Calle 7-43, Zona 4, Guatemala City",
      coordinates: { lat: 14.618889, lng: -90.500278 },
      zone: "Zona 4",
      recipientName: "Miguel Paredes",
      notes: "Central business",
    },
  ],
  expectedSavings: {
    distanceKm: 12,
    timeMin: 22,
    fuelCostGTQ: 80,
    co2Kg: 2.8,
    improvementPercent: 25,
  },
};

/**
 * Scenario 4: "The Small Route" - Minimal Stops
 * Even small routes benefit
 */
const smallRouteScenario: MockScenario = {
  id: "small-route",
  name: "The Small Route",
  description: "Just a few deliveries - small waste adds up over time",
  stopCount: 3,
  stops: [
    {
      address: "10a Calle 4-20, Zona 9, Guatemala City",
      coordinates: { lat: 14.609722, lng: -90.525556 },
      zone: "Zona 9",
      recipientName: "Andrea Mejía",
      notes: "Residential apartment",
    },
    {
      address: "6a Avenida 14-55, Zona 10, Guatemala City",
      coordinates: { lat: 14.599167, lng: -90.518889 },
      zone: "Zona 10",
      recipientName: "José Marroquín",
      notes: "Small office",
    },
    {
      address: "Calzada Aguilar Batres 22-00, Zona 12, Guatemala City",
      coordinates: { lat: 14.580000, lng: -90.545000 },
      zone: "Zona 12",
      recipientName: "Claudia Escobar",
      notes: "South zone home",
    },
  ],
  expectedSavings: {
    distanceKm: 2.5,
    timeMin: 8,
    fuelCostGTQ: 25,
    co2Kg: 0.6,
    improvementPercent: 10,
  },
};

/**
 * Scenario 5: "The Big Day" - Full Driver Load
 * Biggest absolute savings
 */
const bigDayScenario: MockScenario = {
  id: "big-day",
  name: "The Big Day",
  description: "Driver's full day route (12 stops) - complex inefficient path with major waste",
  stopCount: 12,
  stops: [
    {
      address: "5a Avenida 9-00, Zona 1, Guatemala City",
      coordinates: { lat: 14.636111, lng: -90.514167 },
      zone: "Zona 1",
      recipientName: "Luis Méndez",
    },
    {
      address: "15 Calle 3-51, Zona 10, Guatemala City",
      coordinates: { lat: 14.597222, lng: -90.516389 },
      zone: "Zona 10",
      recipientName: "Isabel Flores",
    },
    {
      address: "Ruta 3 12-24, Zona 4, Guatemala City",
      coordinates: { lat: 14.621111, lng: -90.503889 },
      zone: "Zona 4",
      recipientName: "Oscar Reyes",
    },
    {
      address: "20 Calle 7-18, Zona 11, Guatemala City",
      coordinates: { lat: 14.568333, lng: -90.548056 },
      zone: "Zona 11",
      recipientName: "Beatriz Castro",
    },
    {
      address: "2a Avenida 18-33, Zona 9, Guatemala City",
      coordinates: { lat: 14.606667, lng: -90.528333 },
      zone: "Zona 9",
      recipientName: "Ramiro Soto",
    },
    {
      address: "11 Calle 22-10, Zona 1, Guatemala City",
      coordinates: { lat: 14.639444, lng: -90.511944 },
      zone: "Zona 1",
      recipientName: "Carmen Aguilar",
    },
    {
      address: "8a Calle 5-35, Zona 13, Guatemala City",
      coordinates: { lat: 14.610278, lng: -90.495833 },
      zone: "Zona 13",
      recipientName: "Ernesto Paz",
    },
    {
      address: "Diagonal 12 9-47, Zona 10, Guatemala City",
      coordinates: { lat: 14.600278, lng: -90.520556 },
      zone: "Zona 10",
      recipientName: "Liliana Morales",
    },
    {
      address: "25 Calle 10-12, Zona 5, Guatemala City",
      coordinates: { lat: 14.615000, lng: -90.508889 },
      zone: "Zona 5",
      recipientName: "Javier Sandoval",
    },
    {
      address: "12 Avenida 4-62, Zona 2, Guatemala City",
      coordinates: { lat: 14.642778, lng: -90.509722 },
      zone: "Zona 2",
      recipientName: "Sofía Navarro",
    },
    {
      address: "18 Calle 7-00, Zona 15, Guatemala City",
      coordinates: { lat: 14.608611, lng: -90.492222 },
      zone: "Zona 15",
      recipientName: "Hugo Medina",
    },
    {
      address: "7a Avenida 14-28, Zona 7, Guatemala City",
      coordinates: { lat: 14.624722, lng: -90.557778 },
      zone: "Zona 7",
      recipientName: "Teresa Ramos",
    },
  ],
  expectedSavings: {
    distanceKm: 24,
    timeMin: 48,
    fuelCostGTQ: 180,
    co2Kg: 5.5,
    improvementPercent: 40,
  },
};

/**
 * Scenario 6: "The Zone Pairs" - Common Business Pattern
 * Zona 4 ↔ Zona 10 back and forth
 */
const zonePairsScenario: MockScenario = {
  id: "zone-pairs",
  name: "The Zone Pairs",
  description: "Common business route (Zona 4 ↔ Zona 10) - alternating pickups/deliveries waste trips",
  stopCount: 6,
  stops: [
    {
      address: "5a Avenida 12-00, Zona 4, Guatemala City",
      coordinates: { lat: 14.619444, lng: -90.502778 },
      zone: "Zona 4",
      recipientName: "Alberto Pineda",
      notes: "Pickup - Documents",
    },
    {
      address: "6a Avenida 10-25, Zona 10, Guatemala City",
      coordinates: { lat: 14.601389, lng: -90.518333 },
      zone: "Zona 10",
      recipientName: "Mariana Ruiz",
      notes: "Delivery - Office supplies",
    },
    {
      address: "Ruta 2 9-50, Zona 4, Guatemala City",
      coordinates: { lat: 14.620556, lng: -90.500833 },
      zone: "Zona 4",
      recipientName: "Francisco Díaz",
      notes: "Pickup - Package",
    },
    {
      address: "13 Calle 7-33, Zona 10, Guatemala City",
      coordinates: { lat: 14.602500, lng: -90.516667 },
      zone: "Zona 10",
      recipientName: "Daniela Cruz",
      notes: "Delivery - Legal docs",
    },
    {
      address: "10 Calle 8-18, Zona 4, Guatemala City",
      coordinates: { lat: 14.618889, lng: -90.501667 },
      zone: "Zona 4",
      recipientName: "Eduardo Salazar",
      notes: "Pickup - Electronics",
    },
    {
      address: "Boulevard Los Próceres 18-00, Zona 10, Guatemala City",
      coordinates: { lat: 14.603333, lng: -90.523889 },
      zone: "Zona 10",
      recipientName: "Gloria Herrera",
      notes: "Delivery - Medical supplies",
    },
  ],
  expectedSavings: {
    distanceKm: 9,
    timeMin: 18,
    fuelCostGTQ: 95,
    co2Kg: 2.1,
    improvementPercent: 30,
  },
};

/**
 * All mock scenarios for the Route Optimizer Visualizer
 */
export const MOCK_SCENARIOS: MockScenario[] = [
  zigzagScenario,
  sameZoneClusterScenario,
  longHaulScenario,
  smallRouteScenario,
  bigDayScenario,
  zonePairsScenario,
];

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): MockScenario | undefined {
  return MOCK_SCENARIOS.find((scenario) => scenario.id === id);
}

/**
 * Get default scenario (The Zigzag - most dramatic)
 */
export function getDefaultScenario(): MockScenario {
  return zigzagScenario;
}
