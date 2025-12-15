/**
 * Type definitions for Zone Heat Map Dashboard
 *
 * Defines interfaces for zone metrics, analytics, and visualization
 */

/**
 * Geographic coordinates for zone boundaries
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Comprehensive metrics for a single delivery zone
 */
export interface ZoneMetrics {
  zoneId: string; // e.g., "zona-1"
  zoneName: string; // e.g., "Zona 1 - Centro Histórico"
  orderCount: number;
  totalRevenue: number; // GTQ
  avgDeliveryTime: number; // hours
  deliverySuccessRate: number; // 0-100 percentage
  avgCostPerDelivery: number; // GTQ
  peakHours: HourlyDataPoint[];
  peakDays: DailyDataPoint[];
  boundaries: GeoJSON.Polygon; // Zone boundary coordinates
}

/**
 * Hourly activity pattern for a zone
 */
export interface HourlyDataPoint {
  hour: number; // 0-23
  count: number; // Number of orders
  revenue: number; // Total revenue for this hour
}

/**
 * Daily activity pattern for a zone (by day of week)
 */
export interface DailyDataPoint {
  day: string; // "Sun", "Mon", "Tue", etc.
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  count: number; // Number of orders
  revenue: number; // Total revenue for this day
}

/**
 * Heatmap metric definition for visualization
 */
export interface HeatmapMetric {
  id: "orderVolume" | "revenue" | "avgDeliveryTime" | "successRate";
  label: string;
  description: string;
  format: (value: number) => string;
  colorScheme: "sequential" | "diverging";
  unit?: string;
}

/**
 * Date range filter options
 */
export interface DateRangeFilter {
  preset: "last7days" | "last30days" | "last90days";
  startDate: Date;
  endDate: Date;
}

/**
 * Zone pair analysis (origin → destination patterns)
 */
export interface ZonePairAnalysis {
  fromZone: string;
  toZone: string;
  orderCount: number;
  avgShippingCost: number;
  avgDeliveryTime: number;
}

/**
 * Aggregated statistics across all zones
 */
export interface OverallStats {
  totalOrders: number;
  totalRevenue: number;
  avgDeliveryTime: number;
  overallSuccessRate: number;
  topZones: {
    zoneId: string;
    zoneName: string;
    orderCount: number;
  }[];
}

/**
 * GeoJSON Feature for zone visualization
 */
export interface ZoneFeature extends GeoJSON.Feature<GeoJSON.Polygon> {
  properties: {
    zoneId: string;
    zoneName: string;
    orderCount: number;
    revenue: number;
    avgDeliveryTime: number;
    successRate: number;
    color: string; // Calculated heatmap color
  };
}

/**
 * Complete GeoJSON FeatureCollection for all zones
 */
export interface ZoneBoundariesGeoJSON extends GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  features: ZoneFeature[];
}

/**
 * Time-series data point for trend charts
 */
export interface TimeSeriesDataPoint {
  date: string; // ISO date string "2024-12-01"
  zones: Record<string, number>; // zoneId -> metric value for this date
}

/**
 * View mode toggle for dashboard layout
 */
export type ViewMode = "map" | "charts" | "both";
