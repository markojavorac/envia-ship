/**
 * Drivers API
 *
 * GET /api/drivers - List all drivers
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAllDrivers } from "@/lib/db/queries";

/**
 * GET /api/drivers - List all drivers
 *
 * Authorization: Requires authentication
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drivers = await getAllDrivers();
    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("Failed to fetch drivers:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}
