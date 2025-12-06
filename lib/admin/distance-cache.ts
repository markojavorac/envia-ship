/**
 * Distance Cache Utility
 *
 * In-memory cache for distance calculations to avoid duplicate API calls
 */

import { Coordinates } from "./route-types";

/**
 * Cached distance result
 */
export interface CachedDistance {
  distance: number; // kilometers
  duration: number; // minutes
  timestamp: number; // when cached
}

/**
 * In-memory cache map
 */
const cache = new Map<string, CachedDistance>();

/**
 * Cache expiration time (1 hour)
 * Distances don't change often, so we can cache for a while
 */
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Maximum cache size (prevent memory issues)
 */
const MAX_CACHE_SIZE = 1000;

/**
 * Generate cache key from two coordinates
 *
 * Rounds coordinates to 6 decimal places (~0.1 meters precision)
 * to improve cache hit rate for nearby coordinates
 */
function getCacheKey(coord1: Coordinates, coord2: Coordinates): string {
  const lat1 = coord1.lat.toFixed(6);
  const lng1 = coord1.lng.toFixed(6);
  const lat2 = coord2.lat.toFixed(6);
  const lng2 = coord2.lng.toFixed(6);

  return `${lat1},${lng1}->${lat2},${lng2}`;
}

/**
 * Get cached distance if available and not expired
 */
export function getCachedDistance(coord1: Coordinates, coord2: Coordinates): CachedDistance | null {
  const key = getCacheKey(coord1, coord2);
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  // Check if expired
  const now = Date.now();
  if (now - cached.timestamp > CACHE_EXPIRY_MS) {
    cache.delete(key);
    return null;
  }

  return cached;
}

/**
 * Cache a distance result
 */
export function cacheDistance(
  coord1: Coordinates,
  coord2: Coordinates,
  distance: number,
  duration: number
): void {
  // Prevent cache from growing too large
  if (cache.size >= MAX_CACHE_SIZE) {
    // Delete oldest entries (simple LRU)
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 20%
    const removeCount = Math.floor(MAX_CACHE_SIZE * 0.2);
    for (let i = 0; i < removeCount; i++) {
      cache.delete(entries[i][0]);
    }
  }

  const key = getCacheKey(coord1, coord2);
  cache.set(key, {
    distance,
    duration,
    timestamp: Date.now(),
  });
}

/**
 * Clear the entire cache
 */
export function clearDistanceCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  hitRate?: number;
} {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}
