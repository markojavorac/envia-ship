import type { Coordinates } from "@/lib/admin/route-types";
import { DriverStatus, type TrackedDriver } from "./types";

/**
 * Time to travel between stops (in milliseconds)
 * Range: 30-60 seconds, average 45 seconds
 */
const SEGMENT_DURATION = 45000; // 45 seconds

/**
 * Store last update time for each driver to calculate progress
 */
const driverStartTimes = new Map<string, number>();

/**
 * Interpolate position between two coordinates based on progress (0-1)
 */
export function interpolatePosition(
  start: Coordinates,
  end: Coordinates,
  progress: number
): Coordinates {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return {
    lat: start.lat + (end.lat - start.lat) * clampedProgress,
    lng: start.lng + (end.lng - start.lng) * clampedProgress,
  };
}

/**
 * Calculate distance between two coordinates (simplified)
 * Returns approximate distance in kilometers
 */
export function calculateDistance(start: Coordinates, end: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((end.lat - start.lat) * Math.PI) / 180;
  const dLng = ((end.lng - start.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((start.lat * Math.PI) / 180) *
      Math.cos((end.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Update driver position along their route
 * Called every 2-3 seconds to smoothly animate movement
 */
export function updateDriverPosition(driver: TrackedDriver, deltaTime: number): TrackedDriver {
  // Only update active drivers with routes
  if (driver.status !== DriverStatus.ACTIVE || !driver.route) {
    return driver;
  }

  const route = driver.route;
  const currentStop = route.stops[route.currentStopIndex];
  const nextStop = route.stops[route.currentStopIndex + 1];

  // Route complete - no next stop
  if (!nextStop) {
    return driver;
  }

  // Initialize start time for this driver if not set
  if (!driverStartTimes.has(driver.id)) {
    driverStartTimes.set(driver.id, Date.now());
  }

  const startTime = driverStartTimes.get(driver.id)!;
  const elapsed = Date.now() - startTime;
  const progress = Math.min(1, elapsed / SEGMENT_DURATION);

  // Calculate new position using linear interpolation
  const newPosition = interpolatePosition(currentStop.coordinates, nextStop.coordinates, progress);

  // Check if reached stop (95% threshold to avoid overshooting)
  if (progress >= 0.95) {
    // Mark current stop as completed
    const updatedStops = route.stops.map((stop, index) =>
      index === route.currentStopIndex + 1 ? { ...stop, isCompleted: true } : stop
    );

    // Move to next segment
    const updatedRoute = {
      ...route,
      stops: updatedStops,
      currentStopIndex: route.currentStopIndex + 1,
      stopsCompleted: route.stopsCompleted + 1,
      deliveriesToday: route.deliveriesToday + 1,
    };

    // Reset start time for next segment
    driverStartTimes.set(driver.id, Date.now());

    return {
      ...driver,
      position: nextStop.coordinates,
      route: updatedRoute,
      lastUpdated: new Date(),
    };
  }

  // Update position along current segment
  return {
    ...driver,
    position: newPosition,
    lastUpdated: new Date(),
  };
}

/**
 * Reset simulation state for a driver
 * Useful when driver starts a new route
 */
export function resetDriverSimulation(driverId: string): void {
  driverStartTimes.delete(driverId);
}

/**
 * Clear all simulation state
 */
export function clearSimulationState(): void {
  driverStartTimes.clear();
}

/**
 * Get progress percentage for current segment
 */
export function getSegmentProgress(driver: TrackedDriver): number {
  if (driver.status !== DriverStatus.ACTIVE || !driver.route) {
    return 0;
  }

  if (!driverStartTimes.has(driver.id)) {
    return 0;
  }

  const startTime = driverStartTimes.get(driver.id)!;
  const elapsed = Date.now() - startTime;
  const progress = Math.min(1, elapsed / SEGMENT_DURATION);

  return Math.round(progress * 100);
}
