/**
 * Mock Driver Assist Data
 *
 * Generates sample delivery tickets for testing the driver assist UI
 */

import type { DeliveryTicket } from "./driver-assist-types";

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
