"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HEATMAP_METRICS } from "@/lib/admin/zone-analytics/constants";
import type { HeatmapMetric } from "@/lib/admin/zone-analytics/types";

interface MetricSelectorProps {
  value: HeatmapMetric;
  onChange: (metric: HeatmapMetric) => void;
}

/**
 * Metric Selector Component
 *
 * Dropdown for selecting which metric to visualize on the heatmap
 */
export function MetricSelector({ value, onChange }: MetricSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm font-semibold">Metric:</span>
      <Select
        value={value.id}
        onValueChange={(metricId) => {
          const metric = HEATMAP_METRICS.find((m) => m.id === metricId);
          if (metric) onChange(metric);
        }}
      >
        <SelectTrigger className="bg-card border-border focus:border-primary focus:ring-primary/20 w-[200px] border-2 font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HEATMAP_METRICS.map((metric) => (
            <SelectItem key={metric.id} value={metric.id}>
              <div>
                <div className="font-semibold">{metric.label}</div>
                <div className="text-muted-foreground text-xs">{metric.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
