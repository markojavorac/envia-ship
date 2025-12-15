/**
 * Distance Cache Utility
 *
 * In-memory cache for distance calculations to avoid duplicate API calls
 */

import { Coordinates } from "./route-types";

/**
 * Cached distance result (point-to-point)
 */
export interface CachedDistance {
  distance: number; // kilometers
  duration: number; // minutes
  timestamp: number; // when cached
}

/**
 * Cached distance matrix result
 */
export interface CachedMatrix {
  coordinates: Coordinates[]; // Coordinate set (for validation)
  distanceMatrix: number[][]; // kilometers
  durationMatrix: number[][]; // minutes
  method: "osrm-table" | "osrm-point-to-point" | "haversine";
  timestamp: number; // when cached
}

/**
 * In-memory cache map for point-to-point distances
 */
const cache = new Map<string, CachedDistance>();

/**
 * In-memory cache map for distance matrices
 */
const matrixCache = new Map<string, CachedMatrix>();

/**
 * Cache expiration time (1 hour for point-to-point)
 * Distances don't change often, so we can cache for a while
 */
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Matrix cache expiration time (30 minutes)
 * Shorter expiration due to larger size
 */
const MATRIX_CACHE_EXPIRY_MS = 30 * 60 * 1000;

/**
 * Maximum cache size for point-to-point (prevent memory issues)
 */
const MAX_CACHE_SIZE = 1000;

/**
 * Maximum cache size for matrices (smaller due to larger size)
 */
const MAX_MATRIX_CACHE_SIZE = 50;

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
  matrixSize: number;
  maxMatrixSize: number;
  hitRate?: number;
} {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    matrixSize: matrixCache.size,
    maxMatrixSize: MAX_MATRIX_CACHE_SIZE,
  };
}

/**
 * Generate cache key for distance matrix from coordinate array
 *
 * Sorts coordinates to handle order variations (same set = same key)
 * Rounds to 6 decimal places for better cache hits
 *
 * @param coordinates Array of coordinates
 * @returns Cache key string
 */
function getMatrixCacheKey(coordinates: Coordinates[]): string {
  // Sort coordinates to handle order variations
  const sorted = [...coordinates].sort((a, b) => (a.lat !== b.lat ? a.lat - b.lat : a.lng - b.lng));

  // Create key from sorted coordinates
  return sorted.map((c) => `${c.lat.toFixed(6)},${c.lng.toFixed(6)}`).join("|");
}

/**
 * Get cached distance matrix if available and not expired
 *
 * @param coordinates Array of coordinates (order doesn't matter)
 * @returns Cached matrix or null if not found/expired
 */
export function getCachedMatrix(coordinates: Coordinates[]): CachedMatrix | null {
  const key = getMatrixCacheKey(coordinates);
  const cached = matrixCache.get(key);

  if (!cached) {
    return null;
  }

  // Check if expired
  const now = Date.now();
  if (now - cached.timestamp > MATRIX_CACHE_EXPIRY_MS) {
    matrixCache.delete(key);
    return null;
  }

  console.log("[Matrix Cache] ✅ Cache hit");
  return cached;
}

/**
 * Cache a distance matrix
 *
 * @param coordinates Coordinate array
 * @param matrix Distance and duration matrices with metadata
 */
export function cacheMatrix(
  coordinates: Coordinates[],
  matrix: Omit<CachedMatrix, "timestamp">
): void {
  // Prevent cache from growing too large
  if (matrixCache.size >= MAX_MATRIX_CACHE_SIZE) {
    // Delete oldest entries (simple LRU)
    const entries = Array.from(matrixCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 20%
    const removeCount = Math.floor(MAX_MATRIX_CACHE_SIZE * 0.2);
    for (let i = 0; i < removeCount; i++) {
      matrixCache.delete(entries[i][0]);
    }

    console.log(
      `[Matrix Cache] Evicted ${removeCount} old entries (size was ${matrixCache.size + removeCount})`
    );
  }

  const key = getMatrixCacheKey(coordinates);
  matrixCache.set(key, {
    ...matrix,
    timestamp: Date.now(),
  });

  console.log(`[Matrix Cache] Cached ${coordinates.length}x${coordinates.length} matrix`);
}

/**
 * Clear the matrix cache
 */
export function clearMatrixCache(): void {
  matrixCache.clear();
}
