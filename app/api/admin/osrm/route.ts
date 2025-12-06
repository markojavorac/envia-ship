/**
 * Server-Side OSRM API Route
 *
 * Proxies OSRM requests through Next.js server to avoid CORS issues
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * OSRM public demo server endpoint
 */
const OSRM_BASE_URL = "https://router.project-osrm.org";

/**
 * Timeout for OSRM API requests (2 seconds)
 */
const OSRM_TIMEOUT_MS = 2000;

export async function GET(request: NextRequest) {
  try {
    // Get coordinates from query params
    const searchParams = request.nextUrl.searchParams;
    const fromLng = searchParams.get("fromLng");
    const fromLat = searchParams.get("fromLat");
    const toLng = searchParams.get("toLng");
    const toLat = searchParams.get("toLat");

    // Validate params
    if (!fromLng || !fromLat || !toLng || !toLat) {
      return NextResponse.json(
        { error: "Missing required parameters: fromLng, fromLat, toLng, toLat" },
        { status: 400 }
      );
    }

    // Validate coordinates are numbers
    const coords = [fromLng, fromLat, toLng, toLat].map(Number);
    if (coords.some(isNaN)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Build OSRM API URL
    const osrmUrl = `${OSRM_BASE_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false&alternatives=false&steps=false`;

    console.log("[OSRM API] Requesting road distance:", { fromLat, fromLng, toLat, toLng });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

    try {
      const response = await fetch(osrmUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[OSRM API] Error: ${response.status} ${response.statusText}`);
        return NextResponse.json(
          { error: "OSRM API request failed", status: response.status },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Validate response structure
      if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
        console.warn("[OSRM API] No routes found");
        return NextResponse.json({ error: "No routes found" }, { status: 404 });
      }

      const route = data.routes[0];

      if (typeof route.distance !== "number" || typeof route.duration !== "number") {
        console.warn("[OSRM API] Invalid route data");
        return NextResponse.json({ error: "Invalid route data" }, { status: 500 });
      }

      console.log("[OSRM API] Success:", {
        distance: `${(route.distance / 1000).toFixed(2)} km`,
        duration: `${Math.round(route.duration / 60)} min`,
      });

      return NextResponse.json({
        distance: route.distance, // meters
        duration: route.duration, // seconds
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.warn("[OSRM API] Request timed out");
        return NextResponse.json({ error: "Request timed out" }, { status: 408 });
      }

      console.error("[OSRM API] Fetch error:", fetchError);
      return NextResponse.json({ error: "Network error" }, { status: 500 });
    }
  } catch (error) {
    console.error("[OSRM API] Server error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
