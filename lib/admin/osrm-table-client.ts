/**
 * OSRM Table Client
 *
 * Client-side wrapper for OSRM Table API
 * Fetches distance/duration matrices for batch route optimization
 */

import { Coordinates } from "./route-types";

/**
 * OSRM Table API response (from our Next.js API route)
 */
interface OSRMTableAPIResponse {
  durations: number[][] | null; // seconds (null cells for unreachable pairs)
  distances: number[][] | null; // meters (null cells for unreachable pairs)
  sources: Array<{ location: [number, number]; name?: string }>;
  destinations: Array<{ location: [number, number]; name?: string }>;
}

/**
 * Distance matrix result (converted to application units)
 */
export interface OSRMTableResponse {
  durations: number[][]; // minutes
  distances: number[][]; // kilometers
}

/**
 * Client timeout (10 seconds - matches server timeout)
 */
const CLIENT_TIMEOUT_MS = 10000;

/**
 * Get distance and duration matrix for multiple coordinates using OSRM Table API
 *
 * This is significantly faster than making n² point-to-point requests:
 * - 25 stops: 1 request instead of ~300 requests
 * - 50 stops: 1 request instead of ~1,225 requests
 *
 * @param coordinates Array of coordinates to build matrix for
 * @returns Distance and duration matrices (km and minutes) or null if failed
 */
export async function getOSRMDistanceMatrix(
  coordinates: Coordinates[]
): Promise<OSRMTableResponse | null> {
  if (coordinates.length === 0) {
    console.warn("[OSRM Table Client] Empty coordinates array");
    return null;
  }

  try {
    console.log(
      `[OSRM Table Client] Requesting ${coordinates.length}x${coordinates.length} matrix`
    );

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      // Call our Next.js API route (server-side proxy)
      const response = await fetch("/api/admin/osrm-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates,
          annotations: "duration,distance", // Request both
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.warn(`[OSRM Table Client] API error: ${response.status}`, error);
        return null;
      }

      const data: OSRMTableAPIResponse = await response.json();

      // Validate response
      if (!data.durations || !data.distances) {
        console.warn("[OSRM Table Client] Response missing matrices");
        return null;
      }

      // Check for null cells (unreachable routes)
      const hasNullCells =
        data.durations.some((row) => row.some((cell) => cell === null)) ||
        data.distances.some((row) => row.some((cell) => cell === null));

      if (hasNullCells) {
        console.warn("[OSRM Table Client] ⚠️  Matrix contains null cells (unreachable routes)");
        // Caller should handle this by filling with Haversine estimates
      }

      // Convert units
      const converted = convertOSRMTableResponse(data);

      console.log(
        `[OSRM Table Client] ✅ Success: ${coordinates.length}x${coordinates.length} matrix`
      );

      return converted;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.warn("[OSRM Table Client] Request timed out");
      } else {
        console.warn("[OSRM Table Client] Fetch error:", fetchError);
      }

      return null;
    }
  } catch (error) {
    console.error("[OSRM Table Client] Error:", error);
    return null;
  }
}

/**
 * Convert OSRM Table API response to application format
 *
 * - Meters → Kilometers
 * - Seconds → Minutes
 * - Handle null cells
 *
 * @param data OSRM Table API response
 * @returns Converted matrices
 */
function convertOSRMTableResponse(data: OSRMTableAPIResponse): OSRMTableResponse {
  if (!data.durations || !data.distances) {
    throw new Error("Missing durations or distances in OSRM response");
  }

  const n = data.durations.length;
  const durations: number[][] = [];
  const distances: number[][] = [];

  for (let i = 0; i < n; i++) {
    durations[i] = [];
    distances[i] = [];

    for (let j = 0; j < n; j++) {
      // Convert seconds to minutes (null → 0 for now, caller will handle)
      const durationSeconds = data.durations[i][j];
      durations[i][j] = durationSeconds !== null ? Math.round(durationSeconds / 60) : 0;

      // Convert meters to kilometers (null → 0 for now, caller will handle)
      const distanceMeters = data.distances[i][j];
      distances[i][j] = distanceMeters !== null ? distanceMeters / 1000 : 0;
    }
  }

  return {
    durations,
    distances,
  };
}

/**
 * Check if distance matrix has null/zero cells (unreachable routes)
 *
 * @param matrix Distance or duration matrix
 * @returns True if any cells are zero (indicating unreachable route)
 */
export function hasUnreachablePairs(matrix: number[][]): boolean {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      // Diagonal should be zero (distance from point to itself)
      if (i === j) continue;

      // Off-diagonal zeros indicate unreachable routes
      if (matrix[i][j] === 0) {
        return true;
      }
    }
  }

  return false;
}
