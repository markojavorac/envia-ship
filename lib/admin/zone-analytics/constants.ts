/**
 * Constants for Zone Heat Map Dashboard
 */

import type { HeatmapMetric } from "./types";

/**
 * Available heatmap metrics for visualization
 */
export const HEATMAP_METRICS: HeatmapMetric[] = [
  {
    id: "orderVolume",
    label: "Order Volume",
    description: "Total number of orders per zone",
    format: (value: number) => value.toFixed(0),
    colorScheme: "sequential",
    unit: "orders",
  },
  {
    id: "revenue",
    label: "Revenue",
    description: "Total revenue generated per zone",
    format: (value: number) => `Q${value.toFixed(2)}`,
    colorScheme: "sequential",
    unit: "GTQ",
  },
  {
    id: "avgDeliveryTime",
    label: "Avg Delivery Time",
    description: "Average time to deliver orders in zone",
    format: (value: number) => `${value.toFixed(1)}h`,
    colorScheme: "sequential",
    unit: "hours",
  },
  {
    id: "successRate",
    label: "Success Rate",
    description: "Percentage of successful deliveries",
    format: (value: number) => `${value.toFixed(1)}%`,
    colorScheme: "diverging",
    unit: "%",
  },
];

/**
 * Date range preset definitions
 */
export const DATE_RANGE_PRESETS = [
  {
    id: "last7days",
    label: "Last 7 Days",
    days: 7,
  },
  {
    id: "last30days",
    label: "Last 30 Days",
    days: 30,
  },
  {
    id: "last90days",
    label: "Last 90 Days",
    days: 90,
  },
] as const;

/**
 * Day of week labels
 */
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Hour labels for 24-hour format
 */
export const HOUR_LABELS = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
];

/**
 * Zone color palette for charts
 * High-contrast color scheme with 11 distinct hues for easy differentiation
 */
export const ZONE_COLORS: Record<string, string> = {
  "zona-1": "hsl(10, 85%, 55%)", // Red-orange (TOP ZONE)
  "zona-4": "hsl(200, 85%, 55%)", // Blue
  "zona-7": "hsl(280, 70%, 60%)", // Purple
  "zona-9": "hsl(160, 70%, 50%)", // Teal/Cyan
  "zona-10": "hsl(45, 90%, 55%)", // Yellow-gold
  "zona-11": "hsl(120, 60%, 50%)", // Green
  "zona-12": "hsl(340, 75%, 55%)", // Pink
  "zona-13": "hsl(30, 80%, 55%)", // Orange
  "zona-14": "hsl(260, 65%, 60%)", // Violet
  "zona-15": "hsl(180, 65%, 50%)", // Turquoise
  "zona-16": "hsl(90, 60%, 50%)", // Lime
};
