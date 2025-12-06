/**
 * Batch Geocoding Utility for Route Planner
 *
 * Geocodes multiple addresses with progress tracking
 */

import { RouteStop } from "./route-types";
import { generateStopId } from "./route-utils";

/**
 * Progress callback parameters
 */
export interface GeocodeProgress {
  current: number;
  total: number;
  currentAddress: string;
}

/**
 * Failed geocoding result
 */
export interface GeocodeFailed {
  address: string;
  error: string;
}

/**
 * Batch geocoding result
 */
export interface BatchGeocodeResult {
  successful: RouteStop[];
  failed: GeocodeFailed[];
}

/**
 * Batch geocode a list of addresses
 *
 * Respects Nominatim rate limit of 1 request per second
 *
 * @param addresses Array of address strings to geocode
 * @param onProgress Callback for progress updates
 * @returns Promise with successful and failed geocoding results
 */
export async function batchGeocode(
  addresses: string[],
  onProgress?: (progress: GeocodeProgress) => void
): Promise<BatchGeocodeResult> {
  const successful: RouteStop[] = [];
  const failed: GeocodeFailed[] = [];

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];

    // Update progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: addresses.length,
        currentAddress: address,
      });
    }

    try {
      // Rate limiting: wait 1 second between requests (Nominatim requirement)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Call geocoding API
      const response = await fetch(`/api/admin/geocode?q=${encodeURIComponent(address)}`);

      if (!response.ok) {
        failed.push({
          address,
          error: `API error: ${response.status} ${response.statusText}`,
        });
        continue;
      }

      const data = await response.json();

      if (data.success && data.results && data.results.length > 0) {
        // Use first result
        const result = data.results[0];

        successful.push({
          id: generateStopId(),
          address: result.address,
          coordinates: result.coordinates,
          zone: result.zone,
        });
      } else {
        failed.push({
          address,
          error:
            "Address not found in OpenStreetMap database. Try adding more details (street number, zone, landmarks).",
        });
      }
    } catch (error) {
      console.error(`Geocoding error for "${address}":`, error);
      failed.push({
        address,
        error: error instanceof Error ? error.message : "Network error during geocoding",
      });
    }
  }

  return { successful, failed };
}

/**
 * Batch geocode with notes attached to each address
 */
export async function batchGeocodeWithNotes(
  addressesWithNotes: Array<{ address: string; notes?: string }>,
  onProgress?: (progress: GeocodeProgress) => void
): Promise<BatchGeocodeResult> {
  const successful: RouteStop[] = [];
  const failed: GeocodeFailed[] = [];

  for (let i = 0; i < addressesWithNotes.length; i++) {
    const { address, notes } = addressesWithNotes[i];

    // Update progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: addressesWithNotes.length,
        currentAddress: address,
      });
    }

    try {
      // Rate limiting: wait 1 second between requests
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Call geocoding API
      const response = await fetch(`/api/admin/geocode?q=${encodeURIComponent(address)}`);

      if (!response.ok) {
        failed.push({
          address,
          error: `API error: ${response.status} ${response.statusText}`,
        });
        continue;
      }

      const data = await response.json();

      if (data.success && data.results && data.results.length > 0) {
        // Use first result
        const result = data.results[0];

        successful.push({
          id: generateStopId(),
          address: result.address,
          coordinates: result.coordinates,
          zone: result.zone,
          notes, // Attach notes from CSV
        });
      } else {
        failed.push({
          address,
          error:
            "Address not found in OpenStreetMap database. Try adding more details (street number, zone, landmarks).",
        });
      }
    } catch (error) {
      console.error(`Geocoding error for "${address}":`, error);
      failed.push({
        address,
        error: error instanceof Error ? error.message : "Network error during geocoding",
      });
    }
  }

  return { successful, failed };
}
