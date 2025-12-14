/**
 * Load Mock Data API Route
 *
 * Populates the database with 18 test tickets for testing
 */

import { NextResponse } from "next/server";
import { getMockTrips } from "@/lib/admin/mock-driver-assist";
import { db } from "@/lib/db/client";

export async function POST() {
  try {
    const mockTrips = getMockTrips();

    // Map mock driver IDs to actual database driver IDs
    const driverIdMap: Record<string, string> = {
      "carlos-mendez": "driver-001",
      "maria-lopez": "driver-002",
      "juan-garcia": "driver-003",
    };

    // Clear existing mock data first
    await db.execute("DELETE FROM delivery_tickets WHERE ticket_number LIKE 'MOCK-%'");

    // Insert mock data
    let insertedCount = 0;

    for (const trip of mockTrips) {
      // Generate unique ID and mock ticket number
      const id = crypto.randomUUID();
      const ticketNumber = `MOCK-${trip.id.split("-")[0]}`;
      const dbDriverId = driverIdMap[trip.driverId] || "driver-001";

      await db.execute({
        sql: `INSERT INTO delivery_tickets (
          id, ticket_number, driver_id,
          origin_address, destination_address,
          origin_coordinates, destination_coordinates,
          created_at, navigation_started_at, completed_at, is_completed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          ticketNumber,
          dbDriverId,
          trip.originAddress,
          trip.destinationAddress,
          JSON.stringify({ lat: 14.634915, lng: -90.506882 }), // Default Guatemala City
          JSON.stringify({ lat: 14.634915, lng: -90.506882 }), // Default Guatemala City
          trip.createdAt.getTime(),
          trip.navigationStartedAt ? trip.navigationStartedAt.getTime() : null,
          trip.completedAt ? trip.completedAt.getTime() : null,
          trip.completedAt ? 1 : 0,
        ],
      });

      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      count: insertedCount,
      message: `Successfully loaded ${insertedCount} mock tickets`,
    });
  } catch (error) {
    console.error("Error loading mock data:", error);
    return NextResponse.json({ error: "Failed to load mock data" }, { status: 500 });
  }
}
