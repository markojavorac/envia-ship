/**
 * OSRM Route API Proxy
 *
 * Server-side endpoint to fetch route geometry from OSRM
 * Used for map visualization (shows roads, not straight lines)
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * OSRM Route API base URL (public server)
 * For production, replace with self-hosted OSRM instance
 */
const OSRM_BASE_URL = "https://router.project-osrm.org";

/**
 * Request timeout (10 seconds)
 */
const TIMEOUT_MS = 10000;

/**
 * Maximum coordinates allowed for route
 */
const MAX_COORDINATES = 100;

/**
 * Coordinate interface
 */
interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Request body schema
 */
interface RouteAPIRequest {
  coordinates: Coordinates[];
}

/**
 * OSRM Route API response schema
 */
interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    geometry: {
      coordinates: [number, number][]; // [lng, lat] pairs
      type: "LineString";
    };
    legs: Array<{
      distance: number; // meters
      duration: number; // seconds
    }>;
    distance: number; // total meters
    duration: number; // total seconds
  }>;
  waypoints: Array<{
    location: [number, number]; // [lng, lat]
    name?: string;
  }>;
}

/**
 * POST /api/admin/osrm-route
 *
 * Get route geometry (actual road path) for visualization
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RouteAPIRequest = await request.json();

    // Validate request
    if (!body.coordinates || !Array.isArray(body.coordinates)) {
      return NextResponse.json({ error: "Missing or invalid coordinates array" }, { status: 400 });
    }

    // Check coordinate count
    if (body.coordinates.length < 2) {
      return NextResponse.json(
        { error: "At least 2 coordinates required for route" },
        { status: 400 }
      );
    }

    if (body.coordinates.length > MAX_COORDINATES) {
      return NextResponse.json(
        {
          error: `Too many coordinates. Maximum ${MAX_COORDINATES} allowed.`,
        },
        { status: 400 }
      );
    }

    // Validate each coordinate
    for (const coord of body.coordinates) {
      if (
        typeof coord.lat !== "number" ||
        typeof coord.lng !== "number" ||
        coord.lat < -90 ||
        coord.lat > 90 ||
        coord.lng < -180 ||
        coord.lng > 180
      ) {
        return NextResponse.json({ error: "Invalid coordinate values" }, { status: 400 });
      }
    }

    // Build OSRM Route API URL
    // Format: /route/v1/driving/lng1,lat1;lng2,lat2;lng3,lat3
    const coordinateString = body.coordinates.map((c) => `${c.lng},${c.lat}`).join(";");

    // Request full geometry in GeoJSON format, skip turn-by-turn steps
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinateString}?overview=full&geometries=geojson&steps=false`;

    console.log(
      `[OSRM Route API] Requesting route geometry for ${body.coordinates.length} waypoints`
    );

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Make request to OSRM
      const osrmResponse = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      // Check response status
      if (!osrmResponse.ok) {
        console.error(
          `[OSRM Route API] HTTP error: ${osrmResponse.status} ${osrmResponse.statusText}`
        );
        return NextResponse.json({ error: "OSRM service unavailable" }, { status: 503 });
      }

      // Parse JSON response
      const data: OSRMRouteResponse = await osrmResponse.json();

      // Check OSRM response code
      if (data.code !== "Ok") {
        console.error(`[OSRM Route API] OSRM error code: ${data.code}`);
        return NextResponse.json({ error: `OSRM error: ${data.code}` }, { status: 400 });
      }

      // Validate response structure
      if (!data.routes || data.routes.length === 0) {
        console.error("[OSRM Route API] No routes in response");
        return NextResponse.json({ error: "No route found" }, { status: 404 });
      }

      const route = data.routes[0]; // Use first (best) route

      // Validate geometry
      if (!route.geometry || !route.geometry.coordinates) {
        console.error("[OSRM Route API] Missing geometry in route");
        return NextResponse.json({ error: "Invalid route geometry" }, { status: 500 });
      }

      console.log(
        `[OSRM Route API] ✅ Success: ${route.geometry.coordinates.length} coordinate pairs, ${(route.distance / 1000).toFixed(1)}km`
      );

      // Return route geometry and metrics
      return NextResponse.json({
        geometry: {
          type: "LineString",
          coordinates: route.geometry.coordinates, // [lng, lat] pairs following roads
        },
        distance: route.distance, // meters
        duration: route.duration, // seconds
        waypoints: data.waypoints,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[OSRM Route API] Request timed out");
        return NextResponse.json({ error: "Request timed out" }, { status: 504 });
      }

      console.error("[OSRM Route API] Fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch from OSRM" }, { status: 500 });
    }
  } catch (error) {
    console.error("[OSRM Route API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
