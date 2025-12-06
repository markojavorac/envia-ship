/**
 * OSRM Client for Road-Based Routing
 *
 * Integrates with Open Source Routing Machine (OSRM) API
 * for accurate road distance and duration calculations
 */

import { Coordinates } from "./route-types";

/**
 * OSRM route response
 */
interface OSRMRouteResponse {
  distance: number; // meters
  duration: number; // seconds
}

/**
 * Timeout for OSRM API requests (5 seconds - increased for server roundtrip)
 */
const OSRM_TIMEOUT_MS = 5000;

/**
 * Get road-based distance and duration between two coordinates using OSRM
 *
 * Now uses server-side API route to avoid CORS issues
 *
 * @param from Starting coordinates
 * @param to Ending coordinates
 * @returns Distance in kilometers and duration in minutes, or null if failed
 */
export async function getOSRMDistance(
  from: Coordinates,
  to: Coordinates
): Promise<OSRMRouteResponse | null> {
  try {
    // Build URL to our Next.js API route (server-side proxy)
    const params = new URLSearchParams({
      fromLng: from.lng.toString(),
      fromLat: from.lat.toString(),
      toLng: to.lng.toString(),
      toLat: to.lat.toString(),
    });

    const url = `/api/admin/osrm?${params.toString()}`;

    console.log("[OSRM Client] Requesting road distance via server API");

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[OSRM Client] API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      // Validate response structure
      if (typeof data.distance !== "number" || typeof data.duration !== "number") {
        console.warn("[OSRM Client] Invalid response data");
        return null;
      }

      console.log("[OSRM Client] ✅ Success:", {
        distance: `${(data.distance / 1000).toFixed(2)} km`,
        duration: `${Math.round(data.duration / 60)} min`,
      });

      return {
        distance: data.distance, // meters
        duration: data.duration, // seconds
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.warn("[OSRM Client] Request timed out");
      } else {
        console.warn("[OSRM Client] Fetch error:", fetchError);
      }
      return null;
    }
  } catch (error) {
    console.error("[OSRM Client] Error:", error);
    return null;
  }
}

/**
 * Convert OSRM response to application format
 *
 * @param osrmResponse OSRM API response
 * @returns Distance in km and duration in minutes
 */
export function convertOSRMResponse(osrmResponse: OSRMRouteResponse): {
  distance: number;
  duration: number;
} {
  return {
    distance: osrmResponse.distance / 1000, // meters to kilometers
    duration: Math.round(osrmResponse.duration / 60), // seconds to minutes
  };
}
