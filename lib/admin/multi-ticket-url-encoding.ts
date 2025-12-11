/**
 * Multi-Ticket URL Encoding - Shareable Route Generation
 *
 * Extends single-ticket URL encoding to handle optimized routes with multiple tickets.
 * Allows dispatchers to share entire optimized delivery sequences via WhatsApp.
 */

import type { DeliveryTicket, Coordinates } from "./driver-assist-types";
import type { OptimizedRoute } from "./route-types";
import { sanitizeTicketForSharing, type ShareableTicketData } from "./ticket-url-encoding";

/**
 * Shareable route data (sanitized for URL encoding)
 * Contains array of tickets in optimized sequence order
 */
export interface ShareableRouteData {
  routeId: string;
  tickets: ShareableTicketData[]; // Array of tickets in optimized order
  optimizationMetrics?: {
    totalDistance: number; // km
    totalTime: number; // minutes
    distanceSaved: number; // km
    timeSaved: number; // minutes
    improvementPercent: number; // %
  };
}

/**
 * Encode optimized route to shareable URL
 *
 * @param tickets - Array of delivery tickets in optimized order
 * @param optimizationMetrics - Optional route optimization metrics
 * @param baseUrl - Optional base URL (defaults to window.location.origin)
 * @returns Full URL with encoded route data
 *
 * @example
 * const url = encodeRouteToUrl(optimizedTickets, routeMetrics);
 * // => "https://envia-ship.com/admin/driver-assist?route=eyJyb3V0ZUlkIj..."
 */
export function encodeRouteToUrl(
  tickets: DeliveryTicket[],
  optimizationMetrics?: OptimizedRoute,
  baseUrl?: string
): string {
  const route: ShareableRouteData = {
    routeId: `route-${Date.now()}`,
    tickets: tickets.map(sanitizeTicketForSharing),
    optimizationMetrics: optimizationMetrics
      ? {
          totalDistance: optimizationMetrics.totalDistance,
          totalTime: optimizationMetrics.totalTime,
          distanceSaved: optimizationMetrics.distanceSaved,
          timeSaved: optimizationMetrics.timeSaved,
          improvementPercent: optimizationMetrics.improvementPercent,
        }
      : undefined,
  };

  const json = JSON.stringify(route);

  // Check size before encoding
  const dataSize = new Blob([json]).size;
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (dataSize > maxSize) {
    throw new Error(
      `Route data too large (${(dataSize / 1024 / 1024).toFixed(2)} MB). Maximum is 5MB.`
    );
  }

  // Unicode-safe Base64 encoding
  const base64 = btoa(unescape(encodeURIComponent(json)));

  const url = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const fullUrl = `${url}/admin/driver-assist?route=${base64}`;

  // Check URL length and warn if too long
  if (fullUrl.length > 2000) {
    console.warn(
      `⚠️ URL length is ${fullUrl.length} characters. May be too long for some messaging apps (recommended max: 2000).`
    );

    // Try to compress by removing ticket images
    const compressedRoute: ShareableRouteData = {
      ...route,
      tickets: route.tickets.map((t) => ({ ...t, ticketImageUrl: undefined })),
    };

    const compressedJson = JSON.stringify(compressedRoute);
    const compressedBase64 = btoa(unescape(encodeURIComponent(compressedJson)));
    const compressedUrl = `${url}/admin/driver-assist?route=${compressedBase64}`;

    if (compressedUrl.length <= 2000) {
      console.log(
        `✅ Compressed URL to ${compressedUrl.length} characters by removing ticket images`
      );
      return compressedUrl;
    }
  }

  return fullUrl;
}

/**
 * Validate route data structure
 */
function validateRouteData(data: unknown): data is ShareableRouteData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const route = data as Record<string, unknown>;

  // Required fields
  if (typeof route.routeId !== "string" || route.routeId.trim().length === 0) {
    return false;
  }

  if (!Array.isArray(route.tickets) || route.tickets.length === 0) {
    return false;
  }

  // Validate each ticket in the array
  for (const ticket of route.tickets) {
    if (!ticket || typeof ticket !== "object") {
      return false;
    }

    const t = ticket as Record<string, unknown>;

    // Required fields
    if (typeof t.originAddress !== "string" || t.originAddress.trim().length === 0) {
      return false;
    }

    if (typeof t.destinationAddress !== "string" || t.destinationAddress.trim().length === 0) {
      return false;
    }

    // Validate coordinates if present
    if (t.originCoordinates !== undefined) {
      if (
        !t.originCoordinates ||
        typeof t.originCoordinates !== "object" ||
        typeof (t.originCoordinates as Coordinates).lat !== "number" ||
        typeof (t.originCoordinates as Coordinates).lng !== "number"
      ) {
        return false;
      }

      const { lat, lng } = t.originCoordinates as Coordinates;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return false;
      }
    }

    if (t.destinationCoordinates !== undefined) {
      if (
        !t.destinationCoordinates ||
        typeof t.destinationCoordinates !== "object" ||
        typeof (t.destinationCoordinates as Coordinates).lat !== "number" ||
        typeof (t.destinationCoordinates as Coordinates).lng !== "number"
      ) {
        return false;
      }

      const { lat, lng } = t.destinationCoordinates as Coordinates;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return false;
      }
    }
  }

  // Validate optimization metrics if present
  if (route.optimizationMetrics !== undefined) {
    if (!route.optimizationMetrics || typeof route.optimizationMetrics !== "object") {
      return false;
    }

    const metrics = route.optimizationMetrics as Record<string, unknown>;
    if (
      typeof metrics.totalDistance !== "number" ||
      typeof metrics.totalTime !== "number" ||
      typeof metrics.distanceSaved !== "number" ||
      typeof metrics.timeSaved !== "number" ||
      typeof metrics.improvementPercent !== "number"
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Decode URL parameter to route with multiple tickets
 *
 * @param urlParam - Base64-encoded route data from URL parameter
 * @returns Array of decoded tickets in optimized sequence order, or null if invalid
 *
 * @example
 * const tickets = decodeUrlToRoute("eyJyb3V0ZUlkIj...");
 * if (tickets) {
 *   tickets.forEach(ticket => addTicket(ticket));
 * }
 */
export function decodeUrlToRoute(urlParam: string): DeliveryTicket[] | null {
  try {
    // Unicode-safe Base64 decoding
    const json = decodeURIComponent(escape(atob(urlParam)));
    const data = JSON.parse(json);

    // Validate structure
    if (!validateRouteData(data)) {
      console.error("Invalid route data structure");
      return null;
    }

    // Check data size (reject if > 5MB)
    const dataSize = new Blob([json]).size;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (dataSize > maxSize) {
      console.error("Route data too large:", dataSize);
      return null;
    }

    // Convert to DeliveryTickets with new IDs and timestamps
    // Preserve the optimized sequence order
    const tickets: DeliveryTicket[] = data.tickets.map((t, index) => ({
      id: crypto.randomUUID(),
      ticketNumber: t.ticketNumber,
      originAddress: t.originAddress,
      destinationAddress: t.destinationAddress,
      recipientName: t.recipientName,
      recipientPhone: t.recipientPhone,
      notes: t.notes,
      ticketImageUrl: t.ticketImageUrl,
      originCoordinates: t.originCoordinates,
      destinationCoordinates: t.destinationCoordinates,
      isCompleted: false,
      createdAt: new Date(),
      // Add sequence number to preserve optimized order
      sequenceNumber: index + 1,
    }));

    return tickets;
  } catch (error) {
    console.error("Failed to decode route URL:", error);
    return null;
  }
}

/**
 * Estimate URL length for a route
 * Useful for warning users about excessively long URLs
 *
 * @param tickets - Array of tickets
 * @param optimizationMetrics - Optional route metrics
 * @param baseUrl - Optional base URL
 * @returns Estimated URL length in characters
 */
export function estimateRouteUrlLength(
  tickets: DeliveryTicket[],
  optimizationMetrics?: OptimizedRoute,
  baseUrl?: string
): number {
  try {
    const url = encodeRouteToUrl(tickets, optimizationMetrics, baseUrl);
    return url.length;
  } catch (error) {
    // If encoding fails, return a large number to indicate problem
    return 999999;
  }
}

/**
 * Check if route URL is too long for practical use
 * Most browsers support 2000+ chars, but shorter is better for messaging apps
 *
 * @param tickets - Array of tickets
 * @param optimizationMetrics - Optional route metrics
 * @param baseUrl - Optional base URL
 * @returns true if URL exceeds recommended length
 */
export function isRouteUrlTooLong(
  tickets: DeliveryTicket[],
  optimizationMetrics?: OptimizedRoute,
  baseUrl?: string
): boolean {
  const length = estimateRouteUrlLength(tickets, optimizationMetrics, baseUrl);
  const maxLength = 2000; // Conservative limit for WhatsApp and other messaging apps
  return length > maxLength;
}

/**
 * Get route metadata from encoded URL parameter
 * Useful for preview without full decoding
 *
 * @param urlParam - Base64-encoded route data
 * @returns Route metadata or null if invalid
 */
export function getRouteMetadata(urlParam: string): {
  ticketCount: number;
  routeId: string;
  hasMetrics: boolean;
} | null {
  try {
    const json = decodeURIComponent(escape(atob(urlParam)));
    const data = JSON.parse(json);

    if (!validateRouteData(data)) {
      return null;
    }

    return {
      ticketCount: data.tickets.length,
      routeId: data.routeId,
      hasMetrics: !!data.optimizationMetrics,
    };
  } catch (error) {
    console.error("Failed to get route metadata:", error);
    return null;
  }
}
