/**
 * Mock Driver Assist Data
 *
 * Generates sample delivery tickets for testing the driver assist UI
 * Also provides mock trip history and performance metrics for reports
 */

import type { DeliveryTicket } from "./driver-assist-types";

// Types for Reports Dashboard
interface TripData {
  id: string;
  ticketNumber?: string;
  driverName: string;
  driverId: string;
  originAddress: string;
  destinationAddress: string;
  createdAt: Date;
  navigationStartedAt?: Date;
  completedAt?: Date;
  durationMs: number | null;
  durationMinutes: number | null;
}

interface PerformanceMetric {
  driverId: string;
  driverName: string;
  totalTickets: number;
  totalCompleted: number;
  completionRate: number;
  avgDurationMinutes: number;
  fastestMinutes: number;
  slowestMinutes: number;
}

export function generateMockTickets(): DeliveryTicket[] {
  const now = new Date();

  return [
    {
      id: crypto.randomUUID(),
      ticketNumber: "DTLNO1251452370",
      originAddress: "6 Avenida 14-75, Zona 10, Guatemala City, Guatemala",
      destinationAddress: "Calzada Roosevelt 22-43, Zona 11, Mixco, Guatemala",
      recipientName: "María González",
      recipientPhone: "+502 5555-1234",
      notes: "Fragile - Handle with care. Call before delivery.",
      originCoordinates: { lat: 14.5995, lng: -90.5155 }, // Zona 10
      destinationCoordinates: { lat: 14.6407, lng: -90.5569 }, // Zona 11, Mixco
      isCompleted: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: crypto.randomUUID(),
      ticketNumber: "DTLNO1251452371",
      originAddress: "Centro Comercial Oakland Mall, 18 Avenida 5-56, Zona 10, Guatemala City",
      destinationAddress: "Carretera a El Salvador Km 8.5, Santa Catarina Pinula, Guatemala",
      recipientName: "Carlos Ramírez",
      recipientPhone: "+502 5555-5678",
      notes: "Large package - Electronics",
      originCoordinates: { lat: 14.6067, lng: -90.4897 }, // Oakland Mall, Zona 10
      destinationCoordinates: { lat: 14.5593, lng: -90.4917 }, // Santa Catarina Pinula
      isCompleted: false,
      createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    },
    {
      id: crypto.randomUUID(),
      ticketNumber: "DTLNO1251452372",
      originAddress: "Avenida Las Américas 7-11, Zona 13, Guatemala City, Guatemala",
      destinationAddress: "Boulevard Vista Hermosa 25-67, Zona 15, Guatemala City, Guatemala",
      recipientName: "Ana Morales",
      recipientPhone: "+502 5555-9012",
      notes: "Deliver between 2-4 PM",
      originCoordinates: { lat: 14.6115, lng: -90.5274 }, // Zona 13
      destinationCoordinates: { lat: 14.5897, lng: -90.4951 }, // Zona 15
      isCompleted: false,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: crypto.randomUUID(),
      ticketNumber: "DTLNO1251452373",
      originAddress: "4 Calle 7-53, Zona 9, Guatemala City, Guatemala",
      destinationAddress: "Anillo Periférico 17-36, Zona 8, Mixco, Guatemala",
      recipientName: "José López",
      recipientPhone: "+502 5555-3456",
      notes: "Business delivery - Ask for reception desk",
      originCoordinates: { lat: 14.6089, lng: -90.5141 }, // Zona 9
      destinationCoordinates: { lat: 14.6331, lng: -90.5645 }, // Zona 8, Mixco
      isCompleted: false,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: crypto.randomUUID(),
      ticketNumber: "DTLNO1251452374",
      originAddress: "10 Calle 3-17, Zona 1, Guatemala City, Guatemala",
      destinationAddress: "Avenida Petapa 45-12, Zona 12, Guatemala City, Guatemala",
      recipientName: "Patricia Hernández",
      recipientPhone: "+502 5555-7890",
      originCoordinates: { lat: 14.6417, lng: -90.5133 }, // Zona 1
      destinationCoordinates: { lat: 14.5794, lng: -90.5452 }, // Zona 12
      isCompleted: false,
      createdAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
    },
  ];
}

/**
 * Generate 18 mock completed trips for reports dashboard
 * Distributed across 3 drivers: Carlos Mendez, Maria Lopez, Juan Garcia
 */
export function getMockTrips(): TripData[] {
  const now = new Date();
  const baseTime = now.getTime();

  // Helper to create a trip
  const createTrip = (
    id: number,
    driverId: string,
    driverName: string,
    hoursAgo: number,
    durationMinutes: number
  ): TripData => {
    const completedAt = new Date(baseTime - hoursAgo * 60 * 60 * 1000);
    const navigationStartedAt = new Date(completedAt.getTime() - durationMinutes * 60 * 1000);
    const createdAt = new Date(navigationStartedAt.getTime() - 10 * 60 * 1000); // Created 10 min before nav

    return {
      id: `trip-${id}`,
      ticketNumber: `DTLNO125145${2370 + id}`,
      driverName,
      driverId,
      originAddress: `Origin ${id}, Guatemala City`,
      destinationAddress: `Destination ${id}, Guatemala`,
      createdAt,
      navigationStartedAt,
      completedAt,
      durationMs: durationMinutes * 60 * 1000,
      durationMinutes,
    };
  };

  return [
    // Carlos Mendez - 7 trips (fastest driver, 15-25 min average)
    createTrip(1, "carlos-mendez", "Carlos Mendez", 24, 18),
    createTrip(2, "carlos-mendez", "Carlos Mendez", 22, 22),
    createTrip(3, "carlos-mendez", "Carlos Mendez", 20, 15),
    createTrip(4, "carlos-mendez", "Carlos Mendez", 18, 20),
    createTrip(5, "carlos-mendez", "Carlos Mendez", 16, 25),
    createTrip(6, "carlos-mendez", "Carlos Mendez", 14, 19),
    createTrip(7, "carlos-mendez", "Carlos Mendez", 12, 21),

    // Maria Lopez - 6 trips (consistent driver, 20-30 min average)
    createTrip(8, "maria-lopez", "Maria Lopez", 23, 25),
    createTrip(9, "maria-lopez", "Maria Lopez", 21, 28),
    createTrip(10, "maria-lopez", "Maria Lopez", 19, 22),
    createTrip(11, "maria-lopez", "Maria Lopez", 17, 30),
    createTrip(12, "maria-lopez", "Maria Lopez", 15, 26),
    createTrip(13, "maria-lopez", "Maria Lopez", 13, 24),

    // Juan Garcia - 5 trips (slower driver, 25-40 min average)
    createTrip(14, "juan-garcia", "Juan Garcia", 22, 35),
    createTrip(15, "juan-garcia", "Juan Garcia", 20, 28),
    createTrip(16, "juan-garcia", "Juan Garcia", 18, 40),
    createTrip(17, "juan-garcia", "Juan Garcia", 16, 32),
    createTrip(18, "juan-garcia", "Juan Garcia", 14, 30),
  ];
}

/**
 * Calculate performance metrics from mock trips
 */
export function getMockPerformanceMetrics(): PerformanceMetric[] {
  const trips = getMockTrips();
  const driverGroups = new Map<string, TripData[]>();

  // Group trips by driver
  trips.forEach((trip) => {
    const existing = driverGroups.get(trip.driverId) || [];
    existing.push(trip);
    driverGroups.set(trip.driverId, existing);
  });

  // Calculate metrics for each driver
  const metrics: PerformanceMetric[] = [];

  driverGroups.forEach((driverTrips, driverId) => {
    const completedTrips = driverTrips.filter((t) => t.completedAt);
    const durations = completedTrips
      .map((t) => t.durationMinutes)
      .filter((d): d is number => d !== null);

    const avgDuration =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    metrics.push({
      driverId,
      driverName: driverTrips[0].driverName,
      totalTickets: driverTrips.length,
      totalCompleted: completedTrips.length,
      completionRate: (completedTrips.length / driverTrips.length) * 100,
      avgDurationMinutes: Math.round(avgDuration),
      fastestMinutes: durations.length > 0 ? Math.min(...durations) : 0,
      slowestMinutes: durations.length > 0 ? Math.max(...durations) : 0,
    });
  });

  return metrics;
}
