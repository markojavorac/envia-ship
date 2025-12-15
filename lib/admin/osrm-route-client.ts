/**
 * OSRM Route Client
 *
 * Client-side wrapper for OSRM Route API
 * Fetches route geometry for map visualization (roads, not straight lines)
 */

import { Coordinates } from "./route-types";

/**
 * Route geometry response (from our Next.js API route)
 */
interface OSRMRouteAPIResponse {
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // [lng, lat] pairs following roads
  };
  distance: number; // meters
  duration: number; // seconds
  waypoints: Array<{
    location: [number, number];
    name?: string;
  }>;
}

/**
 * Route geometry result (converted to application units)
 */
export interface OSRMRouteGeometry {
  coordinates: [number, number][]; // [lng, lat] pairs following roads
  distance: number; // kilometers
  duration: number; // minutes
  type: "LineString";
}

/**
 * Client timeout (10 seconds - matches server timeout)
 */
const CLIENT_TIMEOUT_MS = 10000;

/**
 * Get route geometry showing actual road path (for map visualization)
 *
 * This returns the complete path following roads, not a straight line.
 * Use this AFTER optimization to visualize the final route.
 *
 * @param coordinates Array of coordinates in route order
 * @returns Route geometry with road-following coordinates, or null if failed
 */
export async function getOSRMRouteGeometry(
  coordinates: Coordinates[]
): Promise<OSRMRouteGeometry | null> {
  if (coordinates.length < 2) {
    console.warn("[OSRM Route Client] Need at least 2 coordinates for route geometry");
    return null;
  }

  try {
    console.log(
      `[OSRM Route Client] Requesting route geometry for ${coordinates.length} waypoints`
    );

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      // Call our Next.js API route (server-side proxy)
      const response = await fetch("/api/admin/osrm-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.warn(`[OSRM Route Client] API error: ${response.status}`, error);
        return null;
      }

      const data: OSRMRouteAPIResponse = await response.json();

      // Validate response
      if (!data.geometry || !data.geometry.coordinates || data.geometry.coordinates.length === 0) {
        console.warn("[OSRM Route Client] Invalid geometry in response");
        return null;
      }

      // Convert units
      const converted: OSRMRouteGeometry = {
        coordinates: data.geometry.coordinates,
        distance: data.distance / 1000, // meters → km
        duration: Math.round(data.duration / 60), // seconds → minutes
        type: "LineString",
      };

      console.log(
        `[OSRM Route Client] ✅ Success: ${converted.coordinates.length} road coordinates, ${converted.distance.toFixed(1)}km`
      );

      return converted;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.warn("[OSRM Route Client] Request timed out");
      } else {
        console.warn("[OSRM Route Client] Fetch error:", fetchError);
      }

      return null;
    }
  } catch (error) {
    console.error("[OSRM Route Client] Error:", error);
    return null;
  }
}

/**
 * Generate fallback straight-line geometry if OSRM fails
 *
 * This creates a simple LineString connecting coordinates directly.
 * Use as fallback when OSRM Route API is unavailable.
 *
 * @param coordinates Array of coordinates
 * @returns Simple LineString geometry
 */
export function generateStraightLineGeometry(coordinates: Coordinates[]): OSRMRouteGeometry {
  return {
    coordinates: coordinates.map((c) => [c.lng, c.lat]),
    distance: 0, // Unknown without calculation
    duration: 0, // Unknown without calculation
    type: "LineString",
  };
}
