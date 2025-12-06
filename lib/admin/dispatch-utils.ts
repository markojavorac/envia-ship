import { DispatchEntry, DispatchStatus } from "./dispatch-types";
import { generateMockDispatch } from "./mock-dispatch";

/**
 * Dispatch Terminal - Utility Functions
 *
 * Functions for updating dispatch entries, sorting, and calculating metrics.
 * Powers the real-time simulation of the dispatch terminal board.
 */

/**
 * Status priority order for sorting (higher priority appears first)
 */
const STATUS_PRIORITY = {
  [DispatchStatus.READY]: 1, // Ready drivers at top (most urgent)
  [DispatchStatus.LOADING]: 2, // Loading drivers next
  [DispatchStatus.WAITING]: 3, // Waiting drivers after
  [DispatchStatus.DEPARTED]: 4, // Departed at bottom (for reference)
} as const;

/**
 * Sort dispatch entries by status priority, then by estimated departure time
 *
 * @param entries Array of dispatch entries to sort
 * @returns Sorted array (does not mutate original)
 */
export function sortDispatchEntries(entries: DispatchEntry[]): DispatchEntry[] {
  return [...entries].sort((a, b) => {
    // First sort by status priority
    const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Within same status, sort by estimated departure (soonest first)
    return a.estimatedDeparture.getTime() - b.estimatedDeparture.getTime();
  });
}

/**
 * Update dispatch entries for real-time simulation
 *
 * Performs state transitions and simulates package loading:
 * - WAITING → LOADING (after time threshold)
 * - LOADING → increment packages (gradual loading)
 * - LOADING → READY (when fully loaded)
 * - READY → DEPARTED (after time threshold)
 * - DEPARTED → removed (after 5 minutes)
 *
 * @param entries Current dispatch entries
 * @returns Updated entries array
 */
export function updateDispatchEntries(entries: DispatchEntry[]): DispatchEntry[] {
  const now = new Date();
  const updatedEntries: DispatchEntry[] = [];

  // Count how many are currently LOADING (enforce only 1)
  let loadingCount = entries.filter((e) => e.status === DispatchStatus.LOADING).length;

  for (const entry of entries) {
    const timeSinceAssignment = now.getTime() - entry.assignedAt.getTime();
    let updated = { ...entry };

    switch (entry.status) {
      case DispatchStatus.WAITING:
        // Transition to LOADING after 1-2 minutes (random)
        // BUT only if no one else is currently loading
        const waitThreshold = 60000 + (parseInt(entry.id.slice(-3)) % 60000);
        if (loadingCount === 0 && timeSinceAssignment > waitThreshold) {
          updated = {
            ...entry,
            status: DispatchStatus.LOADING,
            loadedPackages: 0,
          };
          loadingCount++; // Increment count since we just added one
        }
        break;

      case DispatchStatus.LOADING:
        // Increment loaded packages (1-3 at a time)
        const increment = Math.floor(Math.random() * 3) + 1;
        const newLoaded = Math.min(entry.loadedPackages + increment, entry.packageCount);

        if (newLoaded >= entry.packageCount) {
          // Fully loaded → transition to READY
          updated = {
            ...entry,
            loadedPackages: entry.packageCount,
            status: DispatchStatus.READY,
          };
        } else {
          // Still loading
          updated = {
            ...entry,
            loadedPackages: newLoaded,
          };
        }
        break;

      case DispatchStatus.READY:
        // Transition to DEPARTED after 30-60 seconds
        // Use entry.id for deterministic threshold
        const readyThreshold = 30000 + (parseInt(entry.id.slice(-3)) % 30000);
        if (timeSinceAssignment > readyThreshold) {
          updated = {
            ...entry,
            status: DispatchStatus.DEPARTED,
            actualDeparture: now,
          };
        }
        break;

      case DispatchStatus.DEPARTED:
        // Remove departed entries after 5 minutes
        if (entry.actualDeparture) {
          const timeSinceDeparture = now.getTime() - entry.actualDeparture.getTime();
          if (timeSinceDeparture > 300000) {
            // 5 minutes = 300000ms
            // Skip this entry (don't add to updatedEntries)
            continue;
          }
        }
        break;
    }

    updatedEntries.push(updated);
  }

  // If we have fewer than 8 entries, add new ones to maintain activity
  if (updatedEntries.length < 8) {
    const neededCount = 8 - updatedEntries.length;
    const newEntries = generateMockDispatch(neededCount);
    updatedEntries.push(...newEntries);
  }

  return updatedEntries;
}

/**
 * Calculate KPI metrics from dispatch entries
 */
export interface DispatchMetrics {
  totalActive: number; // WAITING + LOADING + READY
  loadingNow: number; // LOADING count
  readyToDepart: number; // READY count
  departedToday: number; // DEPARTED count
}

/**
 * Calculate dispatch terminal metrics
 *
 * @param entries Current dispatch entries
 * @returns Metrics object with KPI counts
 */
export function calculateDispatchMetrics(entries: DispatchEntry[]): DispatchMetrics {
  const metrics: DispatchMetrics = {
    totalActive: 0,
    loadingNow: 0,
    readyToDepart: 0,
    departedToday: 0,
  };

  for (const entry of entries) {
    switch (entry.status) {
      case DispatchStatus.WAITING:
        metrics.totalActive++;
        break;
      case DispatchStatus.LOADING:
        metrics.totalActive++;
        metrics.loadingNow++;
        break;
      case DispatchStatus.READY:
        metrics.totalActive++;
        metrics.readyToDepart++;
        break;
      case DispatchStatus.DEPARTED:
        metrics.departedToday++;
        break;
    }
  }

  return metrics;
}

/**
 * Format time until/since a date in human-readable format
 *
 * @param date Target date
 * @returns Formatted string (e.g., "5 min", "NOW", "2 min ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 1) {
    return "NOW";
  }

  if (diffMinutes > 0) {
    // Future time
    if (diffMinutes === 1) return "1 min";
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    // Past time
    const absDiff = Math.abs(diffMinutes);
    if (absDiff === 1) return "1 min ago";
    if (absDiff < 60) return `${absDiff} min ago`;
    const hours = Math.floor(absDiff / 60);
    return `${hours}h ago`;
  }
}

/**
 * Format time as HH:MM (24-hour format)
 *
 * @param date Date to format
 * @returns Time string (e.g., "14:32")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
