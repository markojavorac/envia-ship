/**
 * Driver Assist - localStorage Operations
 *
 * Handles persistent storage of delivery tickets in browser localStorage.
 * Tickets persist across browser sessions until manually deleted.
 */

import type { DeliveryTicket, GeocodingCache } from "./driver-assist-types";

const STORAGE_KEY = "driver-assist-tickets";
const CACHE_KEY = "driver-assist-geocoding-cache";
const MAX_TICKETS = 50; // Prevent unbounded growth

/**
 * Load all tickets from localStorage
 */
export function loadTickets(): DeliveryTicket[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Convert date strings back to Date objects
    return parsed.map((ticket: DeliveryTicket) => ({
      ...ticket,
      createdAt: new Date(ticket.createdAt),
      navigationStartedAt: ticket.navigationStartedAt
        ? new Date(ticket.navigationStartedAt)
        : undefined,
      completedAt: ticket.completedAt ? new Date(ticket.completedAt) : undefined,
    }));
  } catch (error) {
    console.error("Error loading tickets from localStorage:", error);
    return [];
  }
}

/**
 * Save tickets to localStorage
 */
export function saveTickets(tickets: DeliveryTicket[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Enforce MAX_TICKETS limit
    let ticketsToSave = tickets;
    if (tickets.length > MAX_TICKETS) {
      // Remove oldest completed tickets first
      const sorted = [...tickets].sort((a, b) => {
        // Prioritize keeping incomplete tickets
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        // Then sort by creation date (oldest first)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
      ticketsToSave = sorted.slice(-MAX_TICKETS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(ticketsToSave));
  } catch (error) {
    console.error("Error saving tickets to localStorage:", error);

    // Handle QuotaExceededError
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded. Consider clearing old tickets.");
    }
  }
}

/**
 * Add a new ticket
 */
export function addTicket(ticket: DeliveryTicket): DeliveryTicket {
  const tickets = loadTickets();
  const updated = [ticket, ...tickets]; // Add to beginning
  saveTickets(updated);
  return ticket;
}

/**
 * Update an existing ticket
 */
export function updateTicket(ticketId: string, updates: Partial<DeliveryTicket>): DeliveryTicket {
  const tickets = loadTickets();
  const updatedTicket = tickets.find((t) => t.id === ticketId);
  if (!updatedTicket) {
    throw new Error(`Ticket ${ticketId} not found`);
  }

  const updated = tickets.map((ticket) =>
    ticket.id === ticketId ? { ...ticket, ...updates } : ticket
  );
  saveTickets(updated);
  return { ...updatedTicket, ...updates };
}

/**
 * Delete a ticket
 */
export function deleteTicket(ticketId: string): void {
  const tickets = loadTickets();
  const updated = tickets.filter((ticket) => ticket.id !== ticketId);
  saveTickets(updated);
}

/**
 * Mark a ticket as completed
 */
export function completeTicket(ticketId: string): DeliveryTicket {
  return updateTicket(ticketId, {
    isCompleted: true,
    completedAt: new Date(),
  });
}

/**
 * Start navigation for a ticket (records timestamp)
 */
export function startNavigation(ticketId: string): DeliveryTicket {
  return updateTicket(ticketId, {
    navigationStartedAt: new Date(),
  });
}

/**
 * Load geocoding cache from localStorage
 */
export function loadGeocodingCache(): GeocodingCache {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) {
      return {};
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading geocoding cache:", error);
    return {};
  }
}

/**
 * Save geocoding cache to localStorage
 */
export function saveGeocodingCache(cache: GeocodingCache): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving geocoding cache:", error);
  }
}

/**
 * Get cached coordinates for an address
 */
export function getCachedCoordinates(address: string) {
  const cache = loadGeocodingCache();
  const cached = cache[address.toLowerCase().trim()];

  if (!cached) {
    return null;
  }

  // Cache expires after 30 days
  const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - cached.cachedAt > CACHE_DURATION) {
    return null;
  }

  return cached.coordinates;
}

/**
 * Cache coordinates for an address
 */
export function cacheCoordinates(address: string, coordinates: { lat: number; lng: number }): void {
  const cache = loadGeocodingCache();
  cache[address.toLowerCase().trim()] = {
    coordinates,
    cachedAt: Date.now(),
  };
  saveGeocodingCache(cache);
}

/**
 * Clear all geocoding cache
 */
export function clearGeocodingCache(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Error clearing geocoding cache:", error);
  }
}

/**
 * Clear all tickets
 */
export function clearAllTickets(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing tickets:", error);
  }
}

/**
 * Load mock tickets for development/testing
 */
export function loadMockTickets(): DeliveryTicket[] {
  const { generateMockTickets } = require("./mock-driver-assist");
  const mockTickets = generateMockTickets();
  saveTickets(mockTickets);
  return mockTickets;
}
