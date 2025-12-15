/**
 * Data aggregation functions for zone analytics
 *
 * Processes order data to generate zone metrics, time patterns, and statistics
 */

import { subDays } from "date-fns";
import type { Order } from "@/lib/marketplace/types";
import { GUATEMALA_ZONES } from "@/lib/types";
import type {
  ZoneMetrics,
  HourlyDataPoint,
  DailyDataPoint,
  DateRangeFilter,
  OverallStats,
  TimeSeriesDataPoint,
} from "./types";
import { ZONE_BOUNDARIES, ZONE_CENTROIDS } from "./zone-boundaries";
import { DAY_LABELS } from "./constants";

/**
 * Filter orders by date range
 */
export function filterOrdersByDateRange(orders: Order[], dateRange: DateRangeFilter): Order[] {
  const endDate = dateRange.endDate;
  const startDate = dateRange.startDate;

  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
}

/**
 * Create date range filter from preset
 */
export function createDateRangeFilter(
  preset: "last7days" | "last30days" | "last90days"
): DateRangeFilter {
  const endDate = new Date();
  let days: number;

  switch (preset) {
    case "last7days":
      days = 7;
      break;
    case "last30days":
      days = 30;
      break;
    case "last90days":
      days = 90;
      break;
  }

  const startDate = subDays(endDate, days);

  return {
    preset,
    startDate,
    endDate,
  };
}

/**
 * Calculate comprehensive zone metrics from orders
 *
 * Main aggregation function that generates all zone-level statistics
 */
export function calculateZoneMetrics(orders: Order[], dateRange: DateRangeFilter): ZoneMetrics[] {
  const zoneMetrics: ZoneMetrics[] = [];

  // Process each zone
  GUATEMALA_ZONES.forEach((zoneConfig) => {
    const zoneId = zoneConfig.value;
    const zoneName = zoneConfig.label;

    // Filter orders for this zone
    const zoneOrders = orders.filter((order) => order.deliveryZone === zoneId);

    // Calculate basic metrics
    const orderCount = zoneOrders.length;
    const totalRevenue = zoneOrders.reduce((sum, order) => sum + order.totalCost, 0);

    // Calculate average delivery time (simulated - mock data)
    const avgDeliveryTime = calculateAvgDeliveryTime(zoneOrders, zoneId);

    // Calculate success rate (simulated - mock data)
    const deliverySuccessRate = calculateSuccessRate(zoneOrders, zoneId);

    // Calculate average cost per delivery
    const avgCostPerDelivery = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Get time patterns
    const peakHours = aggregateHourlyPattern(zoneOrders);
    const peakDays = aggregateDailyPattern(zoneOrders);

    // Get zone boundaries
    const boundaries = ZONE_BOUNDARIES[zoneId] || {
      type: "Polygon" as const,
      coordinates: [[[0, 0]]],
    };

    zoneMetrics.push({
      zoneId,
      zoneName,
      orderCount,
      totalRevenue,
      avgDeliveryTime,
      deliverySuccessRate,
      avgCostPerDelivery,
      peakHours,
      peakDays,
      boundaries,
    });
  });

  return zoneMetrics;
}

/**
 * Calculate average delivery time for a zone (simulated)
 *
 * Simulation based on zone characteristics:
 * - Central zones (1, 4, 10): 2-4 hours
 * - Residential zones (9, 11, 12): 3-5 hours
 * - Outskirt zones (7, 13-16): 4-6 hours
 */
function calculateAvgDeliveryTime(zoneOrders: Order[], zoneId: string): number {
  if (zoneOrders.length === 0) return 0;

  // Zone-based delivery time simulation
  const centralZones = ["zona-1", "zona-4", "zona-10"];
  const residentialZones = ["zona-9", "zona-11", "zona-12"];

  let baseTime: number;

  if (centralZones.includes(zoneId)) {
    baseTime = 3.0; // 3 hours average
  } else if (residentialZones.includes(zoneId)) {
    baseTime = 4.0; // 4 hours average
  } else {
    baseTime = 5.0; // 5 hours average (outskirts)
  }

  // Add slight random variation based on order count
  const variation = (Math.random() - 0.5) * 0.5; // ±0.25 hours
  return Math.max(2.0, baseTime + variation);
}

/**
 * Calculate delivery success rate for a zone (simulated)
 *
 * Simulation based on zone characteristics:
 * - Business districts (1, 4, 10): 85-95%
 * - Residential zones (9, 11, 12): 75-85%
 * - Outskirts (7, 13-16): 65-75%
 */
function calculateSuccessRate(zoneOrders: Order[], zoneId: string): number {
  if (zoneOrders.length === 0) return 0;

  const businessZones = ["zona-1", "zona-4", "zona-10"];
  const residentialZones = ["zona-9", "zona-11", "zona-12"];

  let baseRate: number;

  if (businessZones.includes(zoneId)) {
    baseRate = 90; // 90% average
  } else if (residentialZones.includes(zoneId)) {
    baseRate = 80; // 80% average
  } else {
    baseRate = 70; // 70% average (outskirts)
  }

  // Add slight variation
  const variation = (Math.random() - 0.5) * 5; // ±2.5%
  return Math.min(100, Math.max(60, baseRate + variation));
}

/**
 * Aggregate hourly pattern for orders
 *
 * Returns 24-hour activity breakdown
 */
function aggregateHourlyPattern(orders: Order[]): HourlyDataPoint[] {
  const hourMap = new Map<number, { count: number; revenue: number }>();

  // Initialize all 24 hours with 0
  for (let hour = 0; hour < 24; hour++) {
    hourMap.set(hour, { count: 0, revenue: 0 });
  }

  // Aggregate orders by hour
  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const hour = orderDate.getHours();
    const existing = hourMap.get(hour)!;

    hourMap.set(hour, {
      count: existing.count + 1,
      revenue: existing.revenue + order.totalCost,
    });
  });

  // Convert to array
  return Array.from(hourMap.entries())
    .map(([hour, data]) => ({
      hour,
      count: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => a.hour - b.hour);
}

/**
 * Aggregate daily pattern for orders (by day of week)
 *
 * Returns 7-day activity breakdown (Sun-Sat)
 */
function aggregateDailyPattern(orders: Order[]): DailyDataPoint[] {
  const dayMap = new Map<number, { count: number; revenue: number }>();

  // Initialize all 7 days with 0
  for (let day = 0; day < 7; day++) {
    dayMap.set(day, { count: 0, revenue: 0 });
  }

  // Aggregate orders by day of week
  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const dayOfWeek = orderDate.getDay(); // 0=Sunday, 6=Saturday
    const existing = dayMap.get(dayOfWeek)!;

    dayMap.set(dayOfWeek, {
      count: existing.count + 1,
      revenue: existing.revenue + order.totalCost,
    });
  });

  // Convert to array
  return Array.from(dayMap.entries())
    .map(([dayOfWeek, data]) => ({
      day: DAY_LABELS[dayOfWeek],
      dayOfWeek,
      count: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

/**
 * Calculate overall statistics across all zones
 */
export function calculateOverallStats(zoneMetrics: ZoneMetrics[]): OverallStats {
  const totalOrders = zoneMetrics.reduce((sum, zone) => sum + zone.orderCount, 0);
  const totalRevenue = zoneMetrics.reduce((sum, zone) => sum + zone.totalRevenue, 0);

  // Weighted average delivery time
  const avgDeliveryTime =
    totalOrders > 0
      ? zoneMetrics.reduce((sum, zone) => sum + zone.avgDeliveryTime * zone.orderCount, 0) /
        totalOrders
      : 0;

  // Weighted average success rate
  const overallSuccessRate =
    totalOrders > 0
      ? zoneMetrics.reduce((sum, zone) => sum + zone.deliverySuccessRate * zone.orderCount, 0) /
        totalOrders
      : 0;

  // Top 3 zones by order count
  const topZones = zoneMetrics
    .filter((zone) => zone.orderCount > 0)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 3)
    .map((zone) => ({
      zoneId: zone.zoneId,
      zoneName: zone.zoneName,
      orderCount: zone.orderCount,
    }));

  return {
    totalOrders,
    totalRevenue,
    avgDeliveryTime,
    overallSuccessRate,
    topZones,
  };
}

/**
 * Get metric value from zone metrics for a specific metric ID
 */
export function getMetricValue(
  zoneMetrics: ZoneMetrics,
  metricId: "orderVolume" | "revenue" | "avgDeliveryTime" | "successRate"
): number {
  switch (metricId) {
    case "orderVolume":
      return zoneMetrics.orderCount;
    case "revenue":
      return zoneMetrics.totalRevenue;
    case "avgDeliveryTime":
      return zoneMetrics.avgDeliveryTime;
    case "successRate":
      return zoneMetrics.deliverySuccessRate;
  }
}

/**
 * Get all values for a specific metric across all zones
 */
export function getAllMetricValues(
  allZoneMetrics: ZoneMetrics[],
  metricId: "orderVolume" | "revenue" | "avgDeliveryTime" | "successRate"
): number[] {
  return allZoneMetrics.map((zone) => getMetricValue(zone, metricId));
}

/**
 * Normalize metric values to 0-1 range for heatmap intensity
 *
 * Ensures full color range is always used by normalizing values relative to min/max
 */
export function normalizeMetricValues(
  zoneMetrics: ZoneMetrics[],
  metricId: "orderVolume" | "revenue" | "avgDeliveryTime" | "successRate"
): Map<string, number> {
  const normalized = new Map<string, number>();

  // Get all values for this metric
  const values = getAllMetricValues(zoneMetrics, metricId);

  if (values.length === 0) return normalized;

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Handle case where all values are the same
  if (minValue === maxValue) {
    zoneMetrics.forEach((zone) => {
      normalized.set(zone.zoneId, 0.5);
    });
    return normalized;
  }

  // Normalize each zone's value to 0-1 range
  zoneMetrics.forEach((zone) => {
    const value = getMetricValue(zone, metricId);
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    normalized.set(zone.zoneId, normalizedValue);
  });

  return normalized;
}

/**
 * Convert zone metrics to GeoJSON Point features for heatmap layer
 *
 * Creates Point features at zone centroids with normalized metric values
 */
export function getZonePointsGeoJSON(
  zoneMetrics: ZoneMetrics[],
  metricId: "orderVolume" | "revenue" | "avgDeliveryTime" | "successRate"
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const normalizedValues = normalizeMetricValues(zoneMetrics, metricId);

  const features: GeoJSON.Feature<GeoJSON.Point>[] = zoneMetrics
    .map((zone) => {
      // Get zone centroid from ZONE_CENTROIDS
      const centroid = ZONE_CENTROIDS[zone.zoneId];

      if (!centroid) {
        console.warn(`No centroid found for zone ${zone.zoneId}`);
        return null;
      }

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [centroid.lng, centroid.lat],
        },
        properties: {
          zoneId: zone.zoneId,
          zoneName: zone.zoneName,
          orderCount: zone.orderCount,
          revenue: zone.totalRevenue,
          avgDeliveryTime: zone.avgDeliveryTime,
          successRate: zone.deliverySuccessRate,
          normalizedValue: normalizedValues.get(zone.zoneId) || 0,
        },
      };
    })
    .filter((f): f is GeoJSON.Feature<GeoJSON.Point> => f !== null);

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Aggregate zone metrics by day for time-series charts
 *
 * Returns daily metric values for each zone across the date range
 */
export function aggregateZoneMetricsByDay(
  orders: Order[],
  dateRange: DateRangeFilter,
  metricId: "orderVolume" | "revenue" | "avgDeliveryTime" | "successRate"
): TimeSeriesDataPoint[] {
  // Create map of dates to zone metrics
  const dateMap = new Map<string, Map<string, number[]>>();

  // Process each order
  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toISOString().split("T")[0]; // "2024-12-01"
    const zoneId = order.deliveryZone;

    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, new Map());
    }

    const zoneMap = dateMap.get(dateStr)!;
    if (!zoneMap.has(zoneId)) {
      zoneMap.set(zoneId, []);
    }

    // Add metric value based on type
    let value: number;
    switch (metricId) {
      case "orderVolume":
        value = 1; // Count orders
        break;
      case "revenue":
        value = order.totalCost;
        break;
      case "avgDeliveryTime":
        // Simulated delivery time (would come from actual delivery data)
        value = 3.5 + Math.random() * 2; // 3.5-5.5 hours
        break;
      case "successRate":
        // Simulated success (1 = success, 0 = failure)
        value = Math.random() > 0.15 ? 1 : 0; // ~85% success rate
        break;
    }

    zoneMap.get(zoneId)!.push(value);
  });

  // Convert map to array of TimeSeriesDataPoint
  const timeSeriesData: TimeSeriesDataPoint[] = [];

  // Get all dates in range
  const currentDate = new Date(dateRange.startDate);
  while (currentDate <= dateRange.endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const zoneMetrics: Record<string, number> = {};

    // Calculate metric for each zone on this date
    GUATEMALA_ZONES.forEach((zoneConfig) => {
      const zoneId = zoneConfig.value;
      const zoneMap = dateMap.get(dateStr);
      const values = zoneMap?.get(zoneId) || [];

      let metricValue: number;
      switch (metricId) {
        case "orderVolume":
          metricValue = values.length; // Count
          break;
        case "revenue":
          metricValue = values.reduce((sum, v) => sum + v, 0); // Sum
          break;
        case "avgDeliveryTime":
          metricValue =
            values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0; // Average
          break;
        case "successRate":
          metricValue =
            values.length > 0 ? (values.reduce((sum, v) => sum + v, 0) / values.length) * 100 : 0; // Percentage
          break;
      }

      zoneMetrics[zoneId] = metricValue;
    });

    timeSeriesData.push({
      date: dateStr,
      zones: zoneMetrics,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return timeSeriesData;
}

/**
 * Get top N zones ranked by a specific metric
 *
 * Returns array of zoneIds sorted by metric value (highest first)
 */
export function getTopZonesByMetric(
  zoneMetrics: ZoneMetrics[],
  metricId: "orderVolume" | "revenue" | "avgDeliveryTime" | "successRate",
  limit: number = 5
): string[] {
  return zoneMetrics
    .map((zone) => ({
      zoneId: zone.zoneId,
      value: getMetricValue(zone, metricId),
    }))
    .sort((a, b) => b.value - a.value) // Descending order
    .slice(0, limit)
    .map((z) => z.zoneId);
}
