/**
 * Driver Assist - Geocoding Service
 *
 * Handles geocoding of addresses using the existing OpenStreetMap Nominatim API.
 * Implements caching to avoid duplicate API calls for the same addresses.
 */

import type { DeliveryTicket, Coordinates, GeocodeResult } from "./driver-assist-types";
import { getCachedCoordinates, cacheCoordinates } from "./driver-assist-storage";

interface GeocodeOptions {
  useCache?: boolean; // Default true
}

/**
 * Geocode a single address using the existing geocoding API
 */
export async function geocodeAddress(
  address: string,
  options: GeocodeOptions = {}
): Promise<GeocodeResult> {
  const { useCache = true } = options;

  // Check cache first (if enabled)
  if (useCache) {
    const cached = getCachedCoordinates(address);
    if (cached) {
      return {
        success: true,
        coordinates: cached,
      };
    }
  }

  try {
    // Call existing geocoding API
    const response = await fetch(`/api/admin/geocode?q=${encodeURIComponent(address)}`);

    if (!response.ok) {
      console.error("Geocoding API error:", response.status, response.statusText);
      return {
        success: false,
        coordinates: null,
        error: `Geocoding failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.success || !data.results || data.results.length === 0) {
      return {
        success: false,
        coordinates: null,
        error: "No results found for this address",
      };
    }

    const coords: Coordinates = {
      lat: data.results[0].coordinates.lat,
      lng: data.results[0].coordinates.lng,
    };

    // Cache the result
    cacheCoordinates(address, coords);

    return {
      success: true,
      coordinates: coords,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      success: false,
      coordinates: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Geocode both origin and destination addresses for a ticket
 */
export async function geocodeTicket(ticket: DeliveryTicket): Promise<{
  origin: GeocodeResult;
  destination: GeocodeResult;
}> {
  // Geocode both addresses in parallel for faster results
  const [origin, destination] = await Promise.all([
    geocodeAddress(ticket.originAddress),
    geocodeAddress(ticket.destinationAddress),
  ]);

  return { origin, destination };
}

/**
 * Check if a ticket has both origin and destination coordinates
 */
export function hasCoordinates(ticket: DeliveryTicket): boolean {
  return !!(ticket.originCoordinates && ticket.destinationCoordinates);
}

/**
 * Get or geocode coordinates for a ticket
 * Returns cached coordinates if available, otherwise geocodes
 */
export async function getOrGeocodeCoordinates(ticket: DeliveryTicket): Promise<{
  success: boolean;
  origin: Coordinates | null;
  destination: Coordinates | null;
  errors: string[];
}> {
  const errors: string[] = [];

  // Use cached coordinates if available
  let origin = ticket.originCoordinates || null;
  let destination = ticket.destinationCoordinates || null;

  // Geocode missing coordinates
  if (!origin || !destination) {
    const results = await geocodeTicket(ticket);

    if (!origin) {
      if (results.origin.success && results.origin.coordinates) {
        origin = results.origin.coordinates;
      } else {
        errors.push(`Origin: ${results.origin.error || "Unknown error"}`);
      }
    }

    if (!destination) {
      if (results.destination.success && results.destination.coordinates) {
        destination = results.destination.coordinates;
      } else {
        errors.push(`Destination: ${results.destination.error || "Unknown error"}`);
      }
    }
  }

  const success = !!(origin && destination);

  return {
    success,
    origin,
    destination,
    errors,
  };
}
