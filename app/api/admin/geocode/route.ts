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
 * GET /api/admin/geocode
 *
 * Geocode an address using OpenStreetMap Nominatim
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

    // Enhance query with Guatemala City context if not already present
    // This prioritizes Guatemala City results over other cities
    let enhancedQuery = query;
    const hasGuatemalaContext =
      /guatemala/i.test(query) || /guatemalteco/i.test(query) || /gt\b/i.test(query);

    if (!hasGuatemalaContext) {
      enhancedQuery = `${query}, Guatemala City, Guatemala`;
      console.log(`[Geocode] Enhanced query: "${query}" -> "${enhancedQuery}"`);
    }

    console.log(`[Geocode] Processing query: "${enhancedQuery}"`);

    // Rate limiting
    await rateLimitCheck();

    // Build Nominatim API URL
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("q", enhancedQuery);
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("countrycodes", "gt"); // Guatemala only
    nominatimUrl.searchParams.set("limit", "5"); // Top 5 results
    nominatimUrl.searchParams.set("addressdetails", "1");

    console.log(`[Geocode] Nominatim URL: ${nominatimUrl.toString()}`);

    // Call Nominatim
    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "envia-ship-route-planner/1.0", // Required by Nominatim
        Accept: "application/json",
      },
    });

    console.log(`[Geocode] Nominatim response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`[Geocode] Nominatim API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[Geocode] Error response body: ${errorText}`);
      return NextResponse.json(
        {
          success: false,
          error: `Geocoding service error: ${response.status} ${response.statusText}`,
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    console.log(`[Geocode] Nominatim raw response:`, JSON.stringify(data));

    // Parse results
    const results: GeocodingResult[] = Array.isArray(data) ? data.map(parseNominatimResult) : [];

    console.log(`[Geocode] Parsed ${results.length} results`);
    if (results.length === 0) {
      console.warn(`[Geocode] No results found for query: "${enhancedQuery}"`);
    }

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
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
