"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ZoneMetrics, HeatmapMetric } from "@/lib/admin/zone-analytics/types";
import { getMetricValue } from "@/lib/admin/zone-analytics/aggregators";
import { ZONE_COLORS } from "@/lib/admin/zone-analytics/constants";

interface ZoneComparisonChartProps {
  zoneMetrics: ZoneMetrics[];
  selectedMetric: HeatmapMetric;
}

/**
 * Zone Comparison Chart Component
 *
 * Horizontal bar chart showing all zones ranked by selected metric.
 * Top 3 zones highlighted with distinctive colors.
 */
export function ZoneComparisonChart({ zoneMetrics, selectedMetric }: ZoneComparisonChartProps) {
  // Sort zones by metric value (highest first)
  const sortedData = zoneMetrics
    .map((zone) => ({
      zoneName: zone.zoneName,
      zoneId: zone.zoneId,
      value: getMetricValue(zone, selectedMetric.id),
    }))
    .sort((a, b) => b.value - a.value);

  // Format value for display
  const formatValue = (value: number) => {
    return selectedMetric.format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" className="text-muted-foreground text-xs" />
        <YAxis
          type="category"
          dataKey="zoneName"
          width={110}
          className="text-muted-foreground text-xs"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          itemStyle={{ color: "hsl(var(--primary))" }}
          formatter={(value: number) => [formatValue(value), selectedMetric.label]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {sortedData.map((entry) => {
            // All zones use their zone-specific color for consistency
            const color = ZONE_COLORS[entry.zoneId] || "hsl(33, 70%, 60%)";

            return <Cell key={`cell-${entry.zoneId}`} fill={color} opacity={1} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
