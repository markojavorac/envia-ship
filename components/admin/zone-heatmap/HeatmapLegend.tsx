"use client";

import type { HeatmapMetric, ZoneMetrics } from "@/lib/admin/zone-analytics/types";
import { generateGradientStops } from "@/lib/admin/zone-analytics/color-utils";
import { getMetricValue, getAllMetricValues } from "@/lib/admin/zone-analytics/aggregators";

interface HeatmapLegendProps {
  metric: HeatmapMetric;
  zoneMetrics: ZoneMetrics[];
}

/**
 * Heatmap Legend Component
 *
 * Displays color scale with min/max values for the current metric
 * Positioned as an overlay on the map (bottom-right)
 */
export function HeatmapLegend({ metric, zoneMetrics }: HeatmapLegendProps) {
  if (zoneMetrics.length === 0) return null;

  // Get all values for the metric
  const allValues = getAllMetricValues(zoneMetrics, metric.id);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  // Generate gradient colors
  const gradientStops = generateGradientStops(metric, 5);
  const gradientCSS = `linear-gradient(to right, ${gradientStops.join(", ")})`;

  return (
    <div className="border-border bg-card absolute right-4 bottom-4 rounded-md border-2 p-3 shadow-lg">
      <div className="mb-2">
        <h4 className="text-foreground text-sm font-semibold">{metric.label}</h4>
        <p className="text-muted-foreground text-xs">{metric.description}</p>
      </div>

      {/* Gradient Bar */}
      <div
        className="h-5 w-40 rounded"
        // eslint-disable-next-line custom/no-inline-styles
        style={{ background: gradientCSS }}
      />

      {/* Min/Max Labels */}
      <div className="mt-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{metric.format(minValue)}</span>
        <span className="text-muted-foreground">{metric.format(maxValue)}</span>
      </div>
    </div>
  );
}
