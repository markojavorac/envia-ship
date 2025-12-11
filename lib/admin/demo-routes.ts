/**
 * Demo Routes - Guatemala City Delivery Scenarios
 *
 * Realistic delivery addresses designed to demonstrate route optimization.
 * Addresses are chosen to show zigzag pattern (original order) that becomes
 * efficient when optimized, demonstrating ~25-30% improvement.
 */

import type { DeliveryTicket } from "./driver-assist-types";

/**
 * Demo delivery tickets for Guatemala City
 *
 * Strategy:
 * - Warehouse in Zona 10 (central location)
 * - Deliveries jump around geographically when entered sequentially
 * - Nearest Neighbor optimization should cluster nearby deliveries
 * - Expected improvement: ~25-30% distance savings
 */
export const GUATEMALA_DEMO_TICKETS: Omit<DeliveryTicket, "id" | "isCompleted" | "createdAt">[] = [
  {
    ticketNumber: "DEMO001",
    originAddress: "ENVÍA Oficina Central, 12 Calle 1-25, Zona 10, Ciudad de Guatemala",
    destinationAddress: "Avenida Las Américas 9-08, Zona 13, Ciudad de Guatemala",
    recipientName: "María González",
    recipientPhone: "5512-3456",
    notes: "Documentos urgentes - Llamar al llegar",
    originCoordinates: {
      lat: 14.5995,
      lng: -90.5155,
    },
    destinationCoordinates: {
      lat: 14.5832, // Far south - Airport area
      lng: -90.5275,
    },
  },
  {
    ticketNumber: "DEMO002",
    originAddress: "ENVÍA Oficina Central, 12 Calle 1-25, Zona 10, Ciudad de Guatemala",
    destinationAddress: "7a Avenida 15-45, Zona 9, Ciudad de Guatemala",
    recipientName: "Carlos Méndez",
    recipientPhone: "5523-4567",
    notes: "Paquete pequeño - Dejar con portería",
    originCoordinates: {
      lat: 14.5995,
      lng: -90.5155,
    },
    destinationCoordinates: {
      lat: 14.6025, // Close to warehouse - north
      lng: -90.5125,
    },
  },
  {
    ticketNumber: "DEMO003",
    originAddress: "ENVÍA Oficina Central, 12 Calle 1-25, Zona 10, Ciudad de Guatemala",
    destinationAddress: "Calzada Roosevelt 22-43, Zona 11, Ciudad de Guatemala",
    recipientName: "Ana López",
    recipientPhone: "5534-5678",
    notes: "Electrónicos frágiles - Manejar con cuidado",
    originCoordinates: {
      lat: 14.5995,
      lng: -90.5155,
    },
    destinationCoordinates: {
      lat: 14.6142, // West - Roosevelt area
      lng: -90.5485,
    },
  },
  {
    ticketNumber: "DEMO004",
    originAddress: "ENVÍA Oficina Central, 12 Calle 1-25, Zona 10, Ciudad de Guatemala",
    destinationAddress: "4a Calle 7-42, Zona 10, Ciudad de Guatemala",
    recipientName: "Roberto Sánchez",
    recipientPhone: "5545-6789",
    notes: "Contrato legal - Requiere firma",
    originCoordinates: {
      lat: 14.5995,
      lng: -90.5155,
    },
    destinationCoordinates: {
      lat: 14.6005, // Very close to warehouse
      lng: -90.5145,
    },
  },
  {
    ticketNumber: "DEMO005",
    originAddress: "ENVÍA Oficina Central, 12 Calle 1-25, Zona 10, Ciudad de Guatemala",
    destinationAddress: "Boulevard Los Próceres 24-69, Zona 10, Ciudad de Guatemala",
    recipientName: "Patricia Morales",
    recipientPhone: "5556-7890",
    notes: "Medicamentos refrigerados - Mantener frío",
    originCoordinates: {
      lat: 14.5995,
      lng: -90.5155,
    },
    destinationCoordinates: {
      lat: 14.6085, // Northwest - Los Próceres
      lng: -90.5195,
    },
  },
  {
    ticketNumber: "DEMO006",
    originAddress: "ENVÍA Oficina Central, 12 Calle 1-25, Zona 10, Ciudad de Guatemala",
    destinationAddress: "Avenida Petapa 52-40, Zona 12, Ciudad de Guatemala",
    recipientName: "Diego Ramírez",
    recipientPhone: "5567-8901",
    notes: "Computadora portátil - Alta prioridad",
    originCoordinates: {
      lat: 14.5995,
      lng: -90.5155,
    },
    destinationCoordinates: {
      lat: 14.5765, // Far southeast - Petapa area
      lng: -90.5025,
    },
  },
  {
    ticketNumber: "DEMO007",
    originAddress: "ENVÍA Oficina Central, 12 Calle 1-25, Zona 10, Ciudad de Guatemala",
    destinationAddress: "6a Avenida 9-31, Zona 1, Ciudad de Guatemala",
    recipientName: "Lucía Castillo",
    recipientPhone: "5578-9012",
    notes: "Muestras de productos - Oficina piso 3",
    originCoordinates: {
      lat: 14.5995,
      lng: -90.5155,
    },
    destinationCoordinates: {
      lat: 14.6285, // Downtown - Centro Histórico
      lng: -90.5125,
    },
  },
];

/**
 * Generate demo tickets with unique IDs and timestamps
 *
 * @returns Array of complete DeliveryTicket objects ready to use
 */
export function generateDemoTickets(): DeliveryTicket[] {
  return GUATEMALA_DEMO_TICKETS.map((ticket) => ({
    ...ticket,
    id: crypto.randomUUID(),
    isCompleted: false,
    createdAt: new Date(),
  }));
}

/**
 * Get demo ticket count
 */
export function getDemoTicketCount(): number {
  return GUATEMALA_DEMO_TICKETS.length;
}

/**
 * Expected optimization improvement for demo data
 * Based on the zigzag pattern in original order vs clustered optimized order
 */
export const DEMO_EXPECTED_IMPROVEMENT = {
  distanceReduction: 0.25, // 25% distance savings
  timeReduction: 0.2, // 20% time savings
  description:
    "Demo addresses are designed to show cross-zone deliveries that optimize into efficient clusters",
};
