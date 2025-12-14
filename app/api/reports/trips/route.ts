/**
 * Reports Trips API Route
 *
 * Returns completed trip history for reports dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { getCompletedTrips } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driverId") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let trips = await getCompletedTrips(driverId);

    // Apply date filters if provided
    if (startDate || endDate) {
      trips = trips.filter((trip) => {
        if (!trip.completedAt) return false;

        if (startDate && trip.completedAt < new Date(startDate)) {
          return false;
        }
        if (endDate && trip.completedAt > new Date(endDate)) {
          return false;
        }
        return true;
      });
    }

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}
