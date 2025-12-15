/**
 * OSRM Table API Proxy
 *
 * Server-side endpoint to fetch distance/duration matrices from OSRM
 * Avoids CORS issues and enables batch distance calculations
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * OSRM Table API base URL (public server)
 * For production, replace with self-hosted OSRM instance
 */
const OSRM_BASE_URL = "https://router.project-osrm.org";

/**
 * Request timeout (10 seconds for large matrices)
 */
const TIMEOUT_MS = 10000;

/**
 * Maximum coordinates allowed (public server limit)
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
interface TableAPIRequest {
  coordinates: Coordinates[];
  annotations?: "duration" | "distance" | "duration,distance";
}

/**
 * OSRM Table API response schema
 */
interface OSRMTableResponse {
  code: string;
  durations?: number[][]; // seconds (null if unreachable)
  distances?: number[][]; // meters (null if unreachable)
  sources: Array<{ location: [number, number]; name?: string }>;
  destinations: Array<{ location: [number, number]; name?: string }>;
}

/**
 * POST /api/admin/osrm-table
 *
 * Get distance and duration matrix for multiple coordinates
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: TableAPIRequest = await request.json();

    // Validate request
    if (!body.coordinates || !Array.isArray(body.coordinates)) {
      return NextResponse.json({ error: "Missing or invalid coordinates array" }, { status: 400 });
    }

    // Check coordinate count
    if (body.coordinates.length === 0) {
      return NextResponse.json({ error: "Coordinates array cannot be empty" }, { status: 400 });
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

    // Build OSRM Table API URL
    // Format: /table/v1/driving/lng1,lat1;lng2,lat2;lng3,lat3
    const coordinateString = body.coordinates.map((c) => `${c.lng},${c.lat}`).join(";");

    const annotations = body.annotations || "duration,distance";
    const url = `${OSRM_BASE_URL}/table/v1/driving/${coordinateString}?annotations=${annotations}`;

    console.log(`[OSRM Table API] Requesting matrix for ${body.coordinates.length} coordinates`);

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
          `[OSRM Table API] HTTP error: ${osrmResponse.status} ${osrmResponse.statusText}`
        );
        return NextResponse.json({ error: "OSRM service unavailable" }, { status: 503 });
      }

      // Parse JSON response
      const data: OSRMTableResponse = await osrmResponse.json();

      // Check OSRM response code
      if (data.code !== "Ok") {
        console.error(`[OSRM Table API] OSRM error code: ${data.code}`);
        return NextResponse.json({ error: `OSRM error: ${data.code}` }, { status: 400 });
      }

      // Validate response structure
      if (!data.durations && !data.distances) {
        console.error("[OSRM Table API] Response missing durations and distances");
        return NextResponse.json({ error: "Invalid OSRM response" }, { status: 500 });
      }

      console.log(
        `[OSRM Table API] ✅ Success: ${body.coordinates.length}x${body.coordinates.length} matrix`
      );

      // Return successful response
      return NextResponse.json({
        durations: data.durations || null,
        distances: data.distances || null,
        sources: data.sources,
        destinations: data.destinations,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[OSRM Table API] Request timed out");
        return NextResponse.json({ error: "Request timed out" }, { status: 504 });
      }

      console.error("[OSRM Table API] Fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch from OSRM" }, { status: 500 });
    }
  } catch (error) {
    console.error("[OSRM Table API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
