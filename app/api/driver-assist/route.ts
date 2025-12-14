/**
 * Driver Assist API Route
 *
 * CRUD operations for delivery tickets
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllTickets,
  getTicketsByDriver,
  createTicket,
  deleteTicket,
  deleteAllTickets,
  completeTicket,
} from "@/lib/db/queries";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";

// GET - Get all tickets or tickets by driver
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driverId");

    const tickets = driverId ? await getTicketsByDriver(driverId) : await getAllTickets();

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// POST - Create a new ticket or complete an existing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const ticket: DeliveryTicket = body.ticket;
      await createTicket(ticket, body.driverId);
      return NextResponse.json({ success: true, message: "Ticket created" });
    }

    if (action === "complete") {
      const { ticketId, navigationStartedAt, completedAt } = body;
      await completeTicket(
        ticketId,
        new Date(navigationStartedAt),
        new Date(completedAt)
      );
      return NextResponse.json({ success: true, message: "Ticket completed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// DELETE - Delete a ticket or all tickets
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("id");

    if (ticketId === "all") {
      await deleteAllTickets();
      return NextResponse.json({ success: true, message: "All tickets deleted" });
    }

    if (ticketId) {
      await deleteTicket(ticketId);
      return NextResponse.json({ success: true, message: "Ticket deleted" });
    }

    return NextResponse.json({ error: "Ticket ID required" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}
