"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type {
  TimeSeriesDataPoint,
  HeatmapMetric,
  ZoneMetrics,
} from "@/lib/admin/zone-analytics/types";
import { ZONE_COLORS } from "@/lib/admin/zone-analytics/constants";

interface ZoneTrendChartProps {
  timeSeriesData: TimeSeriesDataPoint[];
  selectedZones: string[]; // Up to 3 zones for clarity
  selectedMetric: HeatmapMetric;
  zoneMetrics: ZoneMetrics[]; // For zone name lookup
}

/**
 * Zone Trend Chart Component
 *
 * Line chart showing time-series trends for selected zones.
 * Allows comparison of up to 5 zones simultaneously.
 */
export function ZoneTrendChart({
  timeSeriesData,
  selectedZones,
  selectedMetric,
  zoneMetrics,
}: ZoneTrendChartProps) {
  // Transform time series data for Recharts
  const chartData = timeSeriesData.map((dataPoint) => {
    const point: Record<string, string | number> = {
      date: format(new Date(dataPoint.date), "MMM dd"),
    };

    // Add data for selected zones only
    selectedZones.forEach((zoneId) => {
      point[zoneId] = dataPoint.zones[zoneId] || 0;
    });

    return point;
  });

  // Get zone names for legend
  const getZoneName = (zoneId: string): string => {
    const zone = zoneMetrics.find((z) => z.zoneId === zoneId);
    return zone?.zoneName || zoneId;
  };

  // Format value for tooltip
  const formatValue = (value: number) => {
    return selectedMetric.format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" className="text-muted-foreground text-xs" tick={{ fontSize: 11 }} />
        <YAxis className="text-muted-foreground text-xs" tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))", marginBottom: "8px" }}
          formatter={(value: number) => formatValue(value)}
        />
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          formatter={(value: string) => getZoneName(value)}
        />
        {selectedZones.map((zoneId, index) => (
          <Line
            key={zoneId}
            type="monotone"
            dataKey={zoneId}
            stroke={ZONE_COLORS[zoneId] || "hsl(33, 90%, 50%)"}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            strokeDasharray={index % 2 === 0 ? "0" : "5 5"}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
