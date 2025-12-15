"use client";

import { Button } from "@/components/ui/button";
import { DATE_RANGE_PRESETS } from "@/lib/admin/zone-analytics/constants";
import type { DateRangeFilter } from "@/lib/admin/zone-analytics/types";
import { createDateRangeFilter } from "@/lib/admin/zone-analytics/aggregators";

interface DateRangeSelectorProps {
  value: DateRangeFilter;
  onChange: (dateRange: DateRangeFilter) => void;
}

/**
 * Date Range Selector Component
 *
 * Three preset buttons for quick date range filtering
 */
export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm font-semibold">Date Range:</span>
      <div className="flex gap-2">
        {DATE_RANGE_PRESETS.map((preset) => {
          const isActive = value.preset === preset.id;

          return (
            <Button
              key={preset.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(createDateRangeFilter(preset.id))}
              className={
                isActive
                  ? "bg-primary hover:bg-primary/90 font-semibold text-white"
                  : "border-border hover:bg-muted border-2 font-semibold"
              }
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
