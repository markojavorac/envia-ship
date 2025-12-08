/**
 * Ticket URL Encoding - Shareable URL Generation
 *
 * Utilities for encoding/decoding delivery tickets into shareable URLs.
 * Used by dispatchers to create WhatsApp-friendly links that auto-load
 * tickets into driver queues.
 */

import type { DeliveryTicket, Coordinates } from "./driver-assist-types";

/**
 * Shareable ticket data (sanitized for URL encoding)
 * Excludes internal fields like id, timestamps, completion status
 */
export interface ShareableTicketData {
  ticketNumber?: string;
  originAddress: string;
  destinationAddress: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  ticketImageUrl?: string;
  originCoordinates?: Coordinates;
  destinationCoordinates?: Coordinates;
}

/**
 * Sanitize ticket for sharing (remove internal fields)
 */
export function sanitizeTicketForSharing(ticket: DeliveryTicket): ShareableTicketData {
  return {
    ticketNumber: ticket.ticketNumber,
    originAddress: ticket.originAddress,
    destinationAddress: ticket.destinationAddress,
    recipientName: ticket.recipientName,
    recipientPhone: ticket.recipientPhone,
    notes: ticket.notes,
    ticketImageUrl: ticket.ticketImageUrl,
    originCoordinates: ticket.originCoordinates,
    destinationCoordinates: ticket.destinationCoordinates,
  };
}

/**
 * Encode ticket to shareable URL
 *
 * @param ticket - Delivery ticket to encode
 * @param baseUrl - Optional base URL (defaults to window.location.origin)
 * @returns Full URL with encoded ticket data
 *
 * @example
 * const url = encodeTicketToUrl(ticket);
 * // => "https://envia-ship.com/admin/driver-assist?ticket=eyJ0aWNrZXROdW1iZXIi..."
 */
export function encodeTicketToUrl(ticket: DeliveryTicket, baseUrl?: string): string {
  const sanitized = sanitizeTicketForSharing(ticket);
  const json = JSON.stringify(sanitized);

  // Unicode-safe Base64 encoding
  const base64 = btoa(unescape(encodeURIComponent(json)));

  const url = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${url}/admin/driver-assist?ticket=${base64}`;
}

/**
 * Validate ticket data structure
 */
export function validateTicketData(data: unknown): data is ShareableTicketData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const ticket = data as Record<string, unknown>;

  // Required fields
  if (typeof ticket.originAddress !== "string" || ticket.originAddress.trim().length === 0) {
    return false;
  }

  if (
    typeof ticket.destinationAddress !== "string" ||
    ticket.destinationAddress.trim().length === 0
  ) {
    return false;
  }

  // Optional fields type checking
  if (ticket.ticketNumber !== undefined && typeof ticket.ticketNumber !== "string") {
    return false;
  }

  if (ticket.recipientName !== undefined && typeof ticket.recipientName !== "string") {
    return false;
  }

  if (ticket.recipientPhone !== undefined && typeof ticket.recipientPhone !== "string") {
    return false;
  }

  if (ticket.notes !== undefined && typeof ticket.notes !== "string") {
    return false;
  }

  if (ticket.ticketImageUrl !== undefined && typeof ticket.ticketImageUrl !== "string") {
    return false;
  }

  // Validate coordinates if present
  if (ticket.originCoordinates !== undefined) {
    if (
      !ticket.originCoordinates ||
      typeof ticket.originCoordinates !== "object" ||
      typeof (ticket.originCoordinates as Coordinates).lat !== "number" ||
      typeof (ticket.originCoordinates as Coordinates).lng !== "number"
    ) {
      return false;
    }

    // Validate lat/lng ranges
    const { lat, lng } = ticket.originCoordinates as Coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return false;
    }
  }

  if (ticket.destinationCoordinates !== undefined) {
    if (
      !ticket.destinationCoordinates ||
      typeof ticket.destinationCoordinates !== "object" ||
      typeof (ticket.destinationCoordinates as Coordinates).lat !== "number" ||
      typeof (ticket.destinationCoordinates as Coordinates).lng !== "number"
    ) {
      return false;
    }

    // Validate lat/lng ranges
    const { lat, lng } = ticket.destinationCoordinates as Coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return false;
    }
  }

  return true;
}

/**
 * Decode URL parameter to ticket data
 *
 * @param urlParam - Base64-encoded ticket data from URL parameter
 * @returns Decoded ticket with new id/createdAt, or null if invalid
 *
 * @example
 * const ticket = decodeUrlToTicket("eyJ0aWNrZXROdW1iZXIi...");
 * if (ticket) {
 *   addTicket(ticket);
 * }
 */
export function decodeUrlToTicket(urlParam: string): DeliveryTicket | null {
  try {
    // Unicode-safe Base64 decoding
    const json = decodeURIComponent(escape(atob(urlParam)));
    const data = JSON.parse(json);

    // Validate structure
    if (!validateTicketData(data)) {
      console.error("Invalid ticket data structure");
      return null;
    }

    // Check data size (reject if > 5MB)
    const dataSize = new Blob([json]).size;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (dataSize > maxSize) {
      console.error("Ticket data too large:", dataSize);
      return null;
    }

    // Convert to DeliveryTicket with new id and timestamp
    const ticket: DeliveryTicket = {
      id: crypto.randomUUID(),
      ticketNumber: data.ticketNumber,
      originAddress: data.originAddress,
      destinationAddress: data.destinationAddress,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      notes: data.notes,
      ticketImageUrl: data.ticketImageUrl,
      originCoordinates: data.originCoordinates,
      destinationCoordinates: data.destinationCoordinates,
      isCompleted: false,
      createdAt: new Date(),
    };

    return ticket;
  } catch (error) {
    console.error("Failed to decode ticket URL:", error);
    return null;
  }
}

/**
 * Estimate URL length for a ticket
 * Useful for warning users about excessively long URLs
 */
export function estimateUrlLength(ticket: DeliveryTicket, baseUrl?: string): number {
  const url = encodeTicketToUrl(ticket, baseUrl);
  return url.length;
}

/**
 * Check if URL is too long for practical use
 * Most browsers support 2000+ chars, but shorter is better for messaging apps
 */
export function isUrlTooLong(ticket: DeliveryTicket, baseUrl?: string): boolean {
  const length = estimateUrlLength(ticket, baseUrl);
  const maxLength = 2000; // Conservative limit
  return length > maxLength;
}
