/**
 * Guatemala City Zone Boundaries (GeoJSON)
 *
 * Defines approximate rectangular boundaries for Guatemala City delivery zones.
 * Based on known zone centroids from route optimizer mock scenarios.
 *
 * Note: These are approximate boundaries for MVP demonstration.
 * Future enhancement: Replace with official municipal boundary data.
 */

import type { Coordinates, ZoneBoundariesGeoJSON } from "./types";

/**
 * Zone boundary definitions as GeoJSON Polygons
 * Each polygon is a rectangular approximation (~0.01 degree boundaries around centroid)
 */
export const ZONE_BOUNDARIES: Record<string, GeoJSON.Polygon> = {
  "zona-1": {
    type: "Polygon",
    coordinates: [
      [
        [-90.521, 14.63], // SW corner
        [-90.512, 14.63], // SE corner
        [-90.512, 14.64], // NE corner
        [-90.521, 14.64], // NW corner
        [-90.521, 14.63], // Close polygon (back to SW)
      ],
    ],
  },
  "zona-4": {
    type: "Polygon",
    coordinates: [
      [
        [-90.508, 14.615],
        [-90.497, 14.615],
        [-90.497, 14.625],
        [-90.508, 14.625],
        [-90.508, 14.615],
      ],
    ],
  },
  "zona-7": {
    type: "Polygon",
    coordinates: [
      [
        [-90.562, 14.621],
        [-90.552, 14.621],
        [-90.552, 14.631],
        [-90.562, 14.631],
        [-90.562, 14.621],
      ],
    ],
  },
  "zona-9": {
    type: "Polygon",
    coordinates: [
      [
        [-90.528, 14.603],
        [-90.518, 14.603],
        [-90.518, 14.613],
        [-90.528, 14.613],
        [-90.528, 14.603],
      ],
    ],
  },
  "zona-10": {
    type: "Polygon",
    coordinates: [
      [
        [-90.53, 14.596],
        [-90.52, 14.596],
        [-90.52, 14.606],
        [-90.53, 14.606],
        [-90.53, 14.596],
      ],
    ],
  },
  "zona-11": {
    type: "Polygon",
    coordinates: [
      [
        [-90.542, 14.61],
        [-90.532, 14.61],
        [-90.532, 14.62],
        [-90.542, 14.62],
        [-90.542, 14.61],
      ],
    ],
  },
  "zona-12": {
    type: "Polygon",
    coordinates: [
      [
        [-90.545, 14.595],
        [-90.535, 14.595],
        [-90.535, 14.605],
        [-90.545, 14.605],
        [-90.545, 14.595],
      ],
    ],
  },
  "zona-13": {
    type: "Polygon",
    coordinates: [
      [
        [-90.533, 14.578],
        [-90.523, 14.578],
        [-90.523, 14.588],
        [-90.533, 14.588],
        [-90.533, 14.578],
      ],
    ],
  },
  "zona-14": {
    type: "Polygon",
    coordinates: [
      [
        [-90.515, 14.588],
        [-90.505, 14.588],
        [-90.505, 14.598],
        [-90.515, 14.598],
        [-90.515, 14.588],
      ],
    ],
  },
  "zona-15": {
    type: "Polygon",
    coordinates: [
      [
        [-90.508, 14.598],
        [-90.498, 14.598],
        [-90.498, 14.608],
        [-90.508, 14.608],
        [-90.508, 14.598],
      ],
    ],
  },
  "zona-16": {
    type: "Polygon",
    coordinates: [
      [
        [-90.495, 14.608],
        [-90.485, 14.608],
        [-90.485, 14.618],
        [-90.495, 14.618],
        [-90.495, 14.608],
      ],
    ],
  },
};

/**
 * Zone centroid coordinates for camera positioning
 * Derived from zone boundaries midpoint
 */
export const ZONE_CENTROIDS: Record<string, Coordinates> = {
  "zona-1": { lat: 14.635, lng: -90.5165 },
  "zona-4": { lat: 14.62, lng: -90.5025 },
  "zona-7": { lat: 14.626, lng: -90.557 },
  "zona-9": { lat: 14.608, lng: -90.523 },
  "zona-10": { lat: 14.601, lng: -90.525 },
  "zona-11": { lat: 14.615, lng: -90.537 },
  "zona-12": { lat: 14.6, lng: -90.54 },
  "zona-13": { lat: 14.583, lng: -90.528 },
  "zona-14": { lat: 14.593, lng: -90.51 },
  "zona-15": { lat: 14.603, lng: -90.503 },
  "zona-16": { lat: 14.613, lng: -90.49 },
};

/**
 * Guatemala City map bounds for initial camera position
 */
export const GUATEMALA_CITY_BOUNDS = {
  southwest: { lat: 14.52, lng: -90.58 },
  northeast: { lat: 14.72, lng: -90.42 },
};

/**
 * Get zone centroid for map camera positioning
 */
export function getZoneCentroid(zoneId: string): Coordinates | null {
  return ZONE_CENTROIDS[zoneId] || null;
}

/**
 * Convert zone boundaries to GeoJSON FeatureCollection
 * Properties will be populated by aggregators with metrics data
 */
export function getZoneBoundariesGeoJSON(): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  const features: GeoJSON.Feature<GeoJSON.Polygon>[] = Object.entries(ZONE_BOUNDARIES).map(
    ([zoneId, geometry]) => ({
      type: "Feature",
      geometry,
      properties: {
        zoneId,
        // Initial empty properties - will be populated with metrics
        zoneName: "",
        orderCount: 0,
        revenue: 0,
        avgDeliveryTime: 0,
        successRate: 0,
        color: "#cccccc",
      },
    })
  );

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Check if coordinates are within a zone boundary
 * Uses simple bounding box check (sufficient for rectangular zones)
 */
export function isPointInZone(point: Coordinates, zoneId: string): boolean {
  const boundary = ZONE_BOUNDARIES[zoneId];
  if (!boundary) return false;

  const coords = boundary.coordinates[0];
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  return point.lng >= minLng && point.lng <= maxLng && point.lat >= minLat && point.lat <= maxLat;
}
