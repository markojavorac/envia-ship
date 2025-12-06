/**
 * Chart color utilities for value-based gradient visualization
 * Provides gradient calculation functions for admin dashboard charts
 */

export interface GradientColorConfig {
  baseHue?: number; // Default: 33 (Envia orange)
  minSaturation?: number; // Default: 75
  maxSaturation?: number; // Default: 100
  minLightness?: number; // Default: 45
  maxLightness?: number; // Default: 60
}

/**
 * Calculate a gradient color based on value position within a range
 * Higher values produce brighter/more saturated colors
 * Lower values produce muted/darker colors
 *
 * @param value - The value to calculate color for
 * @param min - Minimum value in dataset
 * @param max - Maximum value in dataset
 * @param config - Optional configuration for hue, saturation, and lightness ranges
 * @returns HSL color string
 */
export function calculateGradientColor(
  value: number,
  min: number,
  max: number,
  config: GradientColorConfig = {}
): string {
  const {
    baseHue = 33,
    minSaturation = 75,
    maxSaturation = 100,
    minLightness = 45,
    maxLightness = 60,
  } = config;

  // Handle edge cases
  if (max === min) return `hsl(${baseHue} ${minSaturation}% ${minLightness}%)`;

  // Calculate ratio (0 to 1) based on value position
  const ratio = (value - min) / (max - min);

  // Interpolate saturation and lightness
  const saturation = minSaturation + ratio * (maxSaturation - minSaturation);
  const lightness = minLightness + ratio * (maxLightness - minLightness);

  return `hsl(${baseHue} ${saturation.toFixed(0)}% ${lightness.toFixed(0)}%)`;
}

/**
 * Apply gradient colors to an array of data points
 * Adds a 'fill' property to each data point
 *
 * @param data - Array of data points
 * @param valueKey - Key to use for gradient calculation
 * @param config - Optional gradient configuration
 * @returns Data array with fill colors added
 */
export function applyGradientToData<T extends Record<string, any>>(
  data: T[],
  valueKey: keyof T,
  config?: GradientColorConfig
): (T & { fill: string })[] {
  const values = data.map((item) => Number(item[valueKey]) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return data.map((item) => ({
    ...item,
    fill: calculateGradientColor(Number(item[valueKey]) || 0, min, max, config),
  }));
}
