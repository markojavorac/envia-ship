"use client";

import {
  AreaChart,
  Area,
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

interface ZoneCompositionChartProps {
  timeSeriesData: TimeSeriesDataPoint[];
  topZones: string[]; // Top 3 zones by total metric value
  selectedMetric: HeatmapMetric;
  zoneMetrics: ZoneMetrics[]; // For zone name lookup
}

/**
 * Zone Composition Chart Component
 *
 * Stacked area chart showing composition of top zones over time.
 * Top 3 zones shown individually, rest grouped as "Others".
 */
export function ZoneCompositionChart({
  timeSeriesData,
  topZones,
  selectedMetric,
  zoneMetrics,
}: ZoneCompositionChartProps) {
  // Transform time series data for stacked area chart
  const chartData = timeSeriesData.map((dataPoint) => {
    const point: Record<string, string | number> = {
      date: format(new Date(dataPoint.date), "MMM dd"),
    };

    // Add top zones individually
    topZones.forEach((zoneId) => {
      point[zoneId] = dataPoint.zones[zoneId] || 0;
    });

    // Calculate "Others" as sum of remaining zones
    const othersValue = Object.entries(dataPoint.zones)
      .filter(([zoneId]) => !topZones.includes(zoneId))
      .reduce((sum, [, value]) => sum + value, 0);

    point["others"] = othersValue;

    return point;
  });

  // Get zone names for legend
  const getZoneName = (zoneId: string): string => {
    if (zoneId === "others") return "Others";
    const zone = zoneMetrics.find((z) => z.zoneId === zoneId);
    return zone?.zoneName || zoneId;
  };

  // Format value for tooltip
  const formatValue = (value: number) => {
    return selectedMetric.format(value);
  };

  // All zones to render (top 5 + others)
  const zonesToRender = [...topZones, "others"];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {topZones.map((zoneId) => (
            <linearGradient
              key={`gradient-${zoneId}`}
              id={`gradient-${zoneId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={ZONE_COLORS[zoneId]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={ZONE_COLORS[zoneId]} stopOpacity={0.2} />
            </linearGradient>
          ))}
          <linearGradient id="gradient-others" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
          </linearGradient>
        </defs>
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
        {zonesToRender.map((zoneId) => (
          <Area
            key={zoneId}
            type="monotone"
            dataKey={zoneId}
            stackId="1"
            stroke={zoneId === "others" ? "hsl(var(--muted-foreground))" : ZONE_COLORS[zoneId]}
            fill={`url(#gradient-${zoneId})`}
            strokeWidth={1.5}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
