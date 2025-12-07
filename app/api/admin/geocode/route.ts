/**
 * Geocoding API Route
 *
 * Proxies geocoding requests to OpenStreetMap Nominatim API
 * to avoid CORS issues and enable rate limiting.
 */

import { NextRequest, NextResponse } from "next/server";
import { GeocodingResult } from "@/lib/admin/route-types";

// Simple in-memory rate limiting
const lastRequestTime = { value: 0 };
const MIN_REQUEST_INTERVAL_MS = 1000; // Nominatim requires 1 request/second max

/**
 * Rate limiting check
 * Nominatim free tier requires max 1 request per second
 */
async function rateLimitCheck(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime.value;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime.value = Date.now();
}

/**
 * Parse Nominatim result to our GeocodingResult format
 */
function parseNominatimResult(result: any): GeocodingResult {
  // Extract zone from address if present (Guatemala zones like "Zona 10")
  const displayName = result.display_name || "";
  const zoneMatch = displayName.match(/Zona\s+(\d+)/i);
  const zone = zoneMatch ? `zona-${zoneMatch[1]}` : undefined;

  return {
    address: result.display_name || "",
    coordinates: {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    },
    displayName: result.display_name || "",
    zone,
  };
}

/**
 * Generate fallback queries for Guatemala addresses
 * Tries progressively simpler queries if initial search fails
 */
function generateFallbackQueries(originalQuery: string): string[] {
  const queries: string[] = [originalQuery];

  // Extract zone if present (e.g., "Zona 10")
  const zoneMatch = originalQuery.match(/Zona\s+(\d+)/i);

  if (zoneMatch) {
    const zone = zoneMatch[0]; // "Zona 10"

    // Try just the zone + city
    queries.push(`${zone}, Guatemala City, Guatemala`);
    queries.push(`${zone}, Ciudad de Guatemala, Guatemala`);
  }

  // Try removing specific addresses/numbers but keeping landmarks
  const withoutNumbers = originalQuery.replace(/\d+-\d+/g, "").replace(/\bKm\.?\s*[\d.]+/gi, "");
  if (withoutNumbers !== originalQuery && withoutNumbers.trim().length > 3) {
    queries.push(withoutNumbers);
  }

  // Try extracting landmark/building name
  const landmarkMatch = originalQuery.match(
    /(Centro\s+Comercial\s+[\w\s]+|Mall\s+[\w\s]+|Oakland\s+Mall)/i
  );
  if (landmarkMatch) {
    queries.push(`${landmarkMatch[0]}, Guatemala City, Guatemala`);
  }

  // Last resort: just Guatemala City center (for Zona addresses)
  if (zoneMatch) {
    queries.push("Guatemala City, Guatemala");
  }

  return [...new Set(queries)]; // Remove duplicates
}

/**
 * Fetch geocoding results from Nominatim with rate limiting
 */
async function fetchNominatim(query: string): Promise<any[]> {
  await rateLimitCheck();

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
  nominatimUrl.searchParams.set("q", query);
  nominatimUrl.searchParams.set("format", "json");
  nominatimUrl.searchParams.set("countrycodes", "gt");
  nominatimUrl.searchParams.set("limit", "5");
  nominatimUrl.searchParams.set("addressdetails", "1");

  console.log(`[Geocode] Trying: ${nominatimUrl.toString()}`);

  const response = await fetch(nominatimUrl.toString(), {
    headers: {
      "User-Agent": "envia-ship-route-planner/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET /api/admin/geocode
 *
 * Geocode an address using OpenStreetMap Nominatim with fallback strategies
 *
 * Query params:
 * - q: Address query string (required)
 *
 * Returns:
 * - success: boolean
 * - results: GeocodingResult[] (top 5 results)
 * - error: string (if failed)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    // Validation
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'q' is required",
        },
        { status: 400 }
      );
    }

    if (query.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Query must be at least 3 characters",
        },
        { status: 400 }
      );
    }

    console.log(`[Geocode] Original query: "${query}"`);

    // Generate fallback queries
    const fallbackQueries = generateFallbackQueries(query);
    console.log(`[Geocode] Generated ${fallbackQueries.length} fallback queries:`, fallbackQueries);

    let results: GeocodingResult[] = [];
    let successfulQuery = "";

    // Try each query until we get results
    for (const fallbackQuery of fallbackQueries) {
      try {
        const data = await fetchNominatim(fallbackQuery);

        if (Array.isArray(data) && data.length > 0) {
          results = data.map(parseNominatimResult);
          successfulQuery = fallbackQuery;
          console.log(`[Geocode] ✓ Found ${results.length} results with: "${fallbackQuery}"`);
          break;
        } else {
          console.log(`[Geocode] ✗ No results for: "${fallbackQuery}"`);
        }
      } catch (error) {
        console.error(`[Geocode] Error with query "${fallbackQuery}":`, error);
        // Continue to next fallback
      }
    }

    if (results.length === 0) {
      console.warn(`[Geocode] All fallback queries failed for: "${query}"`);
      return NextResponse.json({
        success: false,
        error:
          "Could not find this address. Try simplifying (e.g., just 'Zona 10, Guatemala City')",
        results: [],
        count: 0,
      });
    }

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      query: successfulQuery, // Return which query worked
    });
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during geocoding",
      },
      { status: 500 }
    );
  }
}
