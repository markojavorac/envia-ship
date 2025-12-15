/**
 * Color gradient utilities for zone heatmap visualization
 *
 * Extends chart-utils.ts with zone-specific heatmap color calculations
 */

import type { HeatmapMetric } from "./types";

/**
 * Calculate heatmap intensity (0-1) from value relative to dataset
 *
 * Normalizes a value to 0-1 range based on min/max in all values
 */
export function calculateHeatmapIntensity(
  value: number,
  allValues: number[],
  metric?: HeatmapMetric
): number {
  if (allValues.length === 0) return 0;

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  // Handle case where all values are the same
  if (minValue === maxValue) return 0.5;

  // Normalize to 0-1
  const intensity = (value - minValue) / (maxValue - minValue);

  // For diverging metrics (success rate), map differently
  // Values closer to 100% should be higher intensity
  if (metric?.colorScheme === "diverging") {
    return value / 100; // Assume percentage 0-100
  }

  return intensity;
}

/**
 * Calculate heatmap color for a zone based on metric value
 *
 * Sequential metrics (order volume, revenue): Green → Yellow → Red gradient
 * Diverging metrics (success rate): Red → Yellow → Green
 */
export function calculateHeatmapColor(
  value: number,
  metric: HeatmapMetric,
  allValues: number[]
): string {
  const intensity = calculateHeatmapIntensity(value, allValues, metric);

  if (metric.colorScheme === "sequential") {
    return calculateSequentialColor(intensity);
  } else {
    return calculateDivergingColor(intensity);
  }
}

/**
 * Calculate sequential color (Green→Yellow→Red gradient)
 *
 * Low intensity (0): Green - hsl(120, 60%, 40%)
 * Medium intensity (0.5): Yellow - hsl(50, 100%, 50%)
 * High intensity (1): Red - hsl(10, 85%, 55%)
 */
function calculateSequentialColor(intensity: number): string {
  let hue: number;
  let saturation: number;
  let lightness: number;

  if (intensity < 0.5) {
    // Green to Yellow (0 → 0.5)
    const normalized = intensity * 2; // 0-1 range for low half
    hue = 120 - normalized * 70; // 120° (green) → 50° (yellow)
    saturation = 60 + normalized * 40; // 60% → 100%
    lightness = 40 + normalized * 10; // 40% → 50%
  } else {
    // Yellow to Red (0.5 → 1)
    const normalized = (intensity - 0.5) * 2; // 0-1 range for high half
    hue = 50 - normalized * 40; // 50° (yellow) → 10° (red)
    saturation = 100 - normalized * 15; // 100% → 85%
    lightness = 50 + normalized * 5; // 50% → 55%
  }

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

/**
 * Calculate diverging color (Red → Yellow → Green for success rate)
 *
 * Low (0-50%): Red to Yellow
 * High (50-100%): Yellow to Green
 */
function calculateDivergingColor(intensity: number): string {
  let hue: number;
  let saturation: number;
  let lightness: number;

  if (intensity < 0.5) {
    // Low success rate: Red (0°) to Yellow (45°)
    const normalized = intensity * 2; // 0-1 range for low half
    hue = 0 + normalized * 45;
    saturation = 80;
    lightness = 55;
  } else {
    // High success rate: Yellow (45°) to Green (120°)
    const normalized = (intensity - 0.5) * 2; // 0-1 range for high half
    hue = 45 + normalized * 75;
    saturation = 70;
    lightness = 50;
  }

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

/**
 * Generate gradient stops for legend visualization
 *
 * Returns array of color strings for linear gradient
 */
export function generateGradientStops(metric: HeatmapMetric, steps: number = 5): string[] {
  const stops: string[] = [];

  for (let i = 0; i < steps; i++) {
    const intensity = i / (steps - 1);

    if (metric.colorScheme === "sequential") {
      stops.push(calculateSequentialColor(intensity));
    } else {
      stops.push(calculateDivergingColor(intensity));
    }
  }

  return stops;
}

/**
 * Get color for a specific zone based on its metric value
 *
 * This is the main function used by the map component
 */
export function getZoneColor(
  zoneValue: number,
  allZoneValues: number[],
  selectedMetric: HeatmapMetric
): string {
  return calculateHeatmapColor(zoneValue, selectedMetric, allZoneValues);
}
