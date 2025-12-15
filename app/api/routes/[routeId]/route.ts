/**
 * Individual Route API
 *
 * GET /api/routes/[routeId] - Fetch route with authorization check
 * PATCH /api/routes/[routeId] - Update route status
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getRouteById, updateRouteStatus } from "@/lib/db/queries";

/**
 * GET /api/routes/[routeId] - Fetch route with tickets
 *
 * Authorization:
 * - Admin: Can access any route
 * - Driver: Can only access routes assigned to them
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { routeId } = await params;
    const route = await getRouteById(routeId);

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Authorization: Drivers can only access their own routes
    if (session.user.role !== "admin" && route.driverId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only access routes assigned to you" },
        { status: 403 }
      );
    }

    return NextResponse.json({ route });
  } catch (error) {
    console.error("Failed to fetch route:", error);
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 });
  }
}

/**
 * PATCH /api/routes/[routeId] - Update route status
 *
 * Body:
 * {
 *   status: "assigned" | "in_progress" | "completed";
 * }
 *
 * Authorization:
 * - Admin: Can update any route
 * - Driver: Can only update routes assigned to them
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { routeId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validation
    if (!status || !["assigned", "in_progress", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: assigned, in_progress, or completed" },
        { status: 400 }
      );
    }

    // Check route exists and authorization
    const route = await getRouteById(routeId);
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    // Authorization: Drivers can only update their own routes
    if (session.user.role !== "admin" && route.driverId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only update routes assigned to you" },
        { status: 403 }
      );
    }

    // Update route status
    await updateRouteStatus(routeId, status, new Date());

    return NextResponse.json({
      success: true,
      message: `Route status updated to ${status}`,
    });
  } catch (error) {
    console.error("Failed to update route status:", error);
    return NextResponse.json({ error: "Failed to update route status" }, { status: 500 });
  }
}
