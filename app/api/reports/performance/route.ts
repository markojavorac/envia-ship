/**
 * Reports Performance API Route
 *
 * Calculates driver performance metrics from completed trips
 */

import { NextRequest, NextResponse } from "next/server";
import { getCompletedTrips } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driverId") || undefined;

    const trips = await getCompletedTrips(driverId);

    // Group trips by driver
    const driverGroups = new Map<string, typeof trips>();
    trips.forEach((trip) => {
      const existing = driverGroups.get(trip.driverId) || [];
      existing.push(trip);
      driverGroups.set(trip.driverId, existing);
    });

    // Calculate metrics for each driver
    const metrics = Array.from(driverGroups.entries()).map(([driverId, driverTrips]) => {
      const completedTrips = driverTrips.filter((t) => t.completedAt);
      const durations = completedTrips
        .map((t) => t.durationMinutes)
        .filter((d): d is number => d !== null);

      const avgDuration =
        durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

      return {
        driverId,
        driverName: driverTrips[0].driverName,
        totalTickets: driverTrips.length,
        totalCompleted: completedTrips.length,
        completionRate: (completedTrips.length / driverTrips.length) * 100,
        avgDurationMinutes: Math.round(avgDuration),
        fastestMinutes: durations.length > 0 ? Math.min(...durations) : 0,
        slowestMinutes: durations.length > 0 ? Math.max(...durations) : 0,
      };
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Error calculating performance:", error);
    return NextResponse.json({ error: "Failed to calculate performance" }, { status: 500 });
  }
}
