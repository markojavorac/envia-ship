/**
 * Route Management API
 *
 * POST /api/routes - Create a new route with tickets
 * GET /api/routes - List routes (filtered by driver for non-admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createRoute,
  getAllRoutes,
  getRoutesByDriver,
  createTicket,
  type RouteData,
} from "@/lib/db/queries";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";

/**
 * GET /api/routes - List routes
 *
 * Authorization:
 * - Admin: Can see all routes
 * - Driver: Can only see routes assigned to them
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driverId");

    // Admins can filter by driver or see all
    if (session.user.role === "admin") {
      const routes = driverId ? await getRoutesByDriver(driverId) : await getAllRoutes();
      return NextResponse.json({ routes });
    }

    // Drivers can only see their own routes
    const routes = await getRoutesByDriver(session.user.id);
    return NextResponse.json({ routes });
  } catch (error) {
    console.error("Failed to fetch routes:", error);
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}

/**
 * POST /api/routes - Create a new route with tickets
 *
 * Body:
 * {
 *   routeName: string;
 *   driverId: string;
 *   tickets: DeliveryTicket[];
 *   optimizationData?: string;
 *   totalDistanceKm?: number;
 *   estimatedDurationMin?: number;
 * }
 *
 * Authorization: Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create routes
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const {
      routeName,
      driverId,
      tickets,
      optimizationData,
      totalDistanceKm,
      estimatedDurationMin,
    } = body;

    // Validation
    if (!routeName || !driverId || !tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: routeName, driverId, tickets" },
        { status: 400 }
      );
    }

    // Generate route ID
    const routeId = crypto.randomUUID();

    // Create route metadata
    const routeData: RouteData = {
      id: routeId,
      routeName,
      driverId,
      assignedBy: session.user.id,
      totalTickets: tickets.length,
      totalDistanceKm,
      estimatedDurationMin,
      optimizationData: optimizationData ? JSON.stringify(optimizationData) : undefined,
      status: "assigned",
    };

    await createRoute(routeData);

    // Create tickets with route association
    for (let i = 0; i < tickets.length; i++) {
      const ticket: DeliveryTicket = tickets[i];
      await createTicket(ticket, driverId, routeId, i + 1); // sequence starts at 1
    }

    return NextResponse.json(
      {
        success: true,
        routeId,
        message: `Route created with ${tickets.length} tickets`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create route:", error);
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}
