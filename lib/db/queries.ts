/**
 * Database Queries
 *
 * Type-safe database query functions for delivery tickets and drivers
 */

import { db } from "./client";
import type { DeliveryTicket } from "../admin/driver-assist-types";

interface DbTicket {
  id: string;
  ticket_number: string | null;
  driver_id: string;
  origin_address: string;
  destination_address: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  notes: string | null;
  origin_coordinates: string | null; // JSON string
  destination_coordinates: string | null; // JSON string
  created_at: number;
  navigation_started_at: number | null;
  completed_at: number | null;
  is_completed: number;
  sequence_number: number | null;
}

// Convert database row to DeliveryTicket
function dbTicketToDeliveryTicket(row: DbTicket): DeliveryTicket {
  let originCoords = { lat: 14.634915, lng: -90.506882 }; // Default Guatemala City
  let destCoords = { lat: 14.634915, lng: -90.506882 };

  try {
    if (row.origin_coordinates) {
      originCoords = JSON.parse(row.origin_coordinates);
    }
    if (row.destination_coordinates) {
      destCoords = JSON.parse(row.destination_coordinates);
    }
  } catch (e) {
    console.error("Error parsing coordinates:", e);
  }

  return {
    id: row.id,
    ticketNumber: row.ticket_number || `TICKET-${row.id.substring(0, 8)}`,
    originAddress: row.origin_address,
    destinationAddress: row.destination_address,
    recipientName: row.recipient_name || undefined,
    recipientPhone: row.recipient_phone || undefined,
    notes: row.notes || undefined,
    originCoordinates: originCoords,
    destinationCoordinates: destCoords,
    isCompleted: row.is_completed === 1,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Get all delivery tickets
 */
export async function getAllTickets(): Promise<DeliveryTicket[]> {
  const result = await db.execute("SELECT * FROM delivery_tickets ORDER BY created_at DESC");
  return result.rows.map((row) => dbTicketToDeliveryTicket(row as unknown as DbTicket));
}

/**
 * Get tickets by driver ID
 */
export async function getTicketsByDriver(driverId: string): Promise<DeliveryTicket[]> {
  const result = await db.execute({
    sql: "SELECT * FROM delivery_tickets WHERE driver_id = ? ORDER BY created_at DESC",
    args: [driverId],
  });
  return result.rows.map((row) => dbTicketToDeliveryTicket(row as unknown as DbTicket));
}

/**
 * Get completed trips for reports
 */
export async function getCompletedTrips(driverId?: string) {
  const sql = driverId
    ? `SELECT dt.*, d.name as driver_name
       FROM delivery_tickets dt
       JOIN drivers d ON dt.driver_id = d.id
       WHERE dt.is_completed = 1 AND dt.driver_id = ?
       ORDER BY dt.completed_at DESC`
    : `SELECT dt.*, d.name as driver_name
       FROM delivery_tickets dt
       JOIN drivers d ON dt.driver_id = d.id
       WHERE dt.is_completed = 1
       ORDER BY dt.completed_at DESC`;

  const result = driverId ? await db.execute({ sql, args: [driverId] }) : await db.execute(sql);

  return result.rows.map((row: any) => {
    const durationMs =
      row.navigation_started_at && row.completed_at
        ? row.completed_at - row.navigation_started_at
        : null;

    return {
      id: row.id,
      ticketNumber: row.ticket_number || `TICKET-${row.id.substring(0, 8)}`,
      driverId: row.driver_id,
      driverName: row.driver_name,
      originAddress: row.origin_address,
      destinationAddress: row.destination_address,
      createdAt: new Date(row.created_at),
      navigationStartedAt: row.navigation_started_at
        ? new Date(row.navigation_started_at)
        : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      durationMs,
      durationMinutes: durationMs ? Math.round(durationMs / 60000) : null,
    };
  });
}

/**
 * Create a new delivery ticket
 */
export async function createTicket(
  ticket: DeliveryTicket,
  driverId = "driver-001",
  routeId?: string,
  sequenceNumber?: number
): Promise<void> {
  const originCoords = JSON.stringify(ticket.originCoordinates);
  const destCoords = JSON.stringify(ticket.destinationCoordinates);

  await db.execute({
    sql: `INSERT INTO delivery_tickets (
      id, ticket_number, driver_id,
      origin_address, destination_address,
      recipient_name, recipient_phone, notes,
      origin_coordinates, destination_coordinates,
      created_at, is_completed, route_id, sequence_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      ticket.id,
      ticket.ticketNumber || `TICKET-${ticket.id.substring(0, 8)}`,
      driverId,
      ticket.originAddress,
      ticket.destinationAddress,
      ticket.recipientName || null,
      ticket.recipientPhone || null,
      ticket.notes || null,
      originCoords,
      destCoords,
      ticket.createdAt.getTime(),
      ticket.isCompleted ? 1 : 0,
      routeId || null,
      sequenceNumber || null,
    ],
  });
}

/**
 * Update ticket completion status
 */
export async function completeTicket(
  ticketId: string,
  navigationStartedAt: Date,
  completedAt: Date
): Promise<void> {
  await db.execute({
    sql: `UPDATE delivery_tickets
          SET is_completed = 1,
              navigation_started_at = ?,
              completed_at = ?
          WHERE id = ?`,
    args: [navigationStartedAt.getTime(), completedAt.getTime(), ticketId],
  });
}

/**
 * Delete a ticket
 */
export async function deleteTicket(ticketId: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM delivery_tickets WHERE id = ?",
    args: [ticketId],
  });
}

/**
 * Delete all tickets (for testing)
 */
export async function deleteAllTickets(): Promise<void> {
  await db.execute("DELETE FROM delivery_tickets");
}

/**
 * Get driver/admin by name for authentication
 */
export async function getUserByUsername(username: string) {
  const result = await db.execute({
    sql: "SELECT * FROM drivers WHERE name = ? OR id = ?",
    args: [username, username],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0] as any;
  return {
    id: row.id,
    username: row.name,
    role: row.role,
    pinHash: row.pin_hash,
  };
}

/**
 * Get all drivers
 */
export async function getAllDrivers() {
  const result = await db.execute(
    "SELECT id, name, phone, role, is_active FROM drivers WHERE role = 'driver'"
  );
  return result.rows;
}

// =============================================================================
// ROUTE MANAGEMENT FUNCTIONS
// =============================================================================

export interface RouteData {
  id: string;
  routeName: string;
  driverId: string;
  assignedBy: string;
  totalTickets: number;
  totalDistanceKm?: number;
  estimatedDurationMin?: number;
  optimizationData?: string; // JSON string of optimization metrics
  status?: "assigned" | "in_progress" | "completed";
}

/**
 * Create a new route with metadata
 */
export async function createRoute(route: RouteData): Promise<void> {
  await db.execute({
    sql: `INSERT INTO routes (
      id, route_name, driver_id, assigned_by,
      total_tickets, total_distance_km, estimated_duration_min,
      optimization_data, created_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      route.id,
      route.routeName,
      route.driverId,
      route.assignedBy,
      route.totalTickets,
      route.totalDistanceKm || null,
      route.estimatedDurationMin || null,
      route.optimizationData || null,
      Date.now(),
      route.status || "assigned",
    ],
  });
}

/**
 * Get route by ID with all associated tickets
 */
export async function getRouteById(routeId: string) {
  // Fetch route metadata
  const routeResult = await db.execute({
    sql: "SELECT * FROM routes WHERE id = ?",
    args: [routeId],
  });

  if (routeResult.rows.length === 0) {
    return null;
  }

  const routeRow = routeResult.rows[0] as any;

  // Fetch associated tickets
  const ticketsResult = await db.execute({
    sql: `SELECT * FROM delivery_tickets
          WHERE route_id = ?
          ORDER BY sequence_number ASC`,
    args: [routeId],
  });

  const tickets = ticketsResult.rows.map((row) => dbTicketToDeliveryTicket(row as unknown as DbTicket));

  return {
    id: routeRow.id,
    routeName: routeRow.route_name,
    driverId: routeRow.driver_id,
    assignedBy: routeRow.assigned_by,
    totalTickets: routeRow.total_tickets,
    totalDistanceKm: routeRow.total_distance_km,
    estimatedDurationMin: routeRow.estimated_duration_min,
    optimizationData: routeRow.optimization_data,
    createdAt: new Date(routeRow.created_at),
    startedAt: routeRow.started_at ? new Date(routeRow.started_at) : undefined,
    completedAt: routeRow.completed_at ? new Date(routeRow.completed_at) : undefined,
    status: routeRow.status,
    tickets,
  };
}

/**
 * Get all routes for a specific driver
 */
export async function getRoutesByDriver(driverId: string) {
  const result = await db.execute({
    sql: `SELECT r.*, d.name as driver_name
          FROM routes r
          JOIN drivers d ON r.driver_id = d.id
          WHERE r.driver_id = ?
          ORDER BY r.created_at DESC`,
    args: [driverId],
  });

  return result.rows.map((row: any) => ({
    id: row.id,
    routeName: row.route_name,
    driverId: row.driver_id,
    driverName: row.driver_name,
    assignedBy: row.assigned_by,
    totalTickets: row.total_tickets,
    totalDistanceKm: row.total_distance_km,
    estimatedDurationMin: row.estimated_duration_min,
    createdAt: new Date(row.created_at),
    startedAt: row.started_at ? new Date(row.started_at) : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    status: row.status,
  }));
}

/**
 * Get all routes (admin view)
 */
export async function getAllRoutes() {
  const result = await db.execute(`
    SELECT r.*, d.name as driver_name
    FROM routes r
    JOIN drivers d ON r.driver_id = d.id
    ORDER BY r.created_at DESC
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    routeName: row.route_name,
    driverId: row.driver_id,
    driverName: row.driver_name,
    assignedBy: row.assigned_by,
    totalTickets: row.total_tickets,
    totalDistanceKm: row.total_distance_km,
    estimatedDurationMin: row.estimated_duration_min,
    createdAt: new Date(row.created_at),
    startedAt: row.started_at ? new Date(row.started_at) : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    status: row.status,
  }));
}

/**
 * Update route status
 */
export async function updateRouteStatus(
  routeId: string,
  status: "assigned" | "in_progress" | "completed",
  timestamp?: Date
): Promise<void> {
  const now = timestamp?.getTime() || Date.now();

  if (status === "in_progress") {
    await db.execute({
      sql: "UPDATE routes SET status = ?, started_at = ? WHERE id = ?",
      args: [status, now, routeId],
    });
  } else if (status === "completed") {
    await db.execute({
      sql: "UPDATE routes SET status = ?, completed_at = ? WHERE id = ?",
      args: [status, now, routeId],
    });
  } else {
    await db.execute({
      sql: "UPDATE routes SET status = ? WHERE id = ?",
      args: [status, routeId],
    });
  }
}

/**
 * Assign tickets to a route with sequence numbers
 */
export async function assignTicketsToRoute(
  ticketIds: string[],
  routeId: string,
  sequences: number[]
): Promise<void> {
  // Batch update all tickets
  for (let i = 0; i < ticketIds.length; i++) {
    await db.execute({
      sql: "UPDATE delivery_tickets SET route_id = ?, sequence_number = ? WHERE id = ?",
      args: [routeId, sequences[i], ticketIds[i]],
    });
  }
}

/**
 * Get tickets by route ID (ordered by sequence)
 */
export async function getTicketsByRoute(routeId: string): Promise<DeliveryTicket[]> {
  const result = await db.execute({
    sql: `SELECT * FROM delivery_tickets
          WHERE route_id = ?
          ORDER BY sequence_number ASC`,
    args: [routeId],
  });
  return result.rows.map((row) => dbTicketToDeliveryTicket(row as unknown as DbTicket));
}
