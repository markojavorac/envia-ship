"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminPageTitle, AdminInfoBox, AdminCard, AdminCardContent } from "@/components/admin/ui";
import { generateMockOrders } from "@/lib/admin/mock-orders";
import {
  calculateZoneMetrics,
  createDateRangeFilter,
  filterOrdersByDateRange,
  aggregateZoneMetricsByDay,
  getTopZonesByMetric,
} from "@/lib/admin/zone-analytics/aggregators";
import { HEATMAP_METRICS } from "@/lib/admin/zone-analytics/constants";
import type { DateRangeFilter, HeatmapMetric } from "@/lib/admin/zone-analytics/types";
import { QuickStatsPanel } from "@/components/admin/zone-heatmap/QuickStatsPanel";
import { ZoneDetailsPanel } from "@/components/admin/zone-heatmap/ZoneDetailsPanel";
import { DateRangeSelector } from "@/components/admin/zone-heatmap/DateRangeSelector";
import { MetricSelector } from "@/components/admin/zone-heatmap/MetricSelector";
import { ZoneComparisonChart } from "@/components/admin/zone-heatmap/charts/ZoneComparisonChart";
import { ZoneTrendChart } from "@/components/admin/zone-heatmap/charts/ZoneTrendChart";
import { ZoneCompositionChart } from "@/components/admin/zone-heatmap/charts/ZoneCompositionChart";
import { Loader2 } from "lucide-react";

// Dynamic import for map component (MapLibre GL doesn't support SSR)
const ZoneHeatmapMap = dynamic(
  () =>
    import("@/components/admin/zone-heatmap/ZoneHeatmapMap").then((mod) => ({
      default: mod.ZoneHeatmapMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="border-border bg-muted flex h-[500px] w-full items-center justify-center rounded-md border-2">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading heatmap...</p>
        </div>
      </div>
    ),
  }
);

/**
 * Zone Heatmap Dashboard Page
 *
 * Interactive radial heatmap showing Guatemala City delivery zones
 * with comprehensive analytics including trends, comparisons, and composition charts.
 */
export default function ZoneHeatmapPage() {
  // State
  const [dateRange, setDateRange] = useState<DateRangeFilter>(createDateRangeFilter("last30days"));
  const [selectedMetric, setSelectedMetric] = useState<HeatmapMetric>(HEATMAP_METRICS[0]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedZonesForTrend, setSelectedZonesForTrend] = useState<string[]>([
    "zona-1",
    "zona-4",
    "zona-10",
  ]);

  // Generate and filter data (memoized)
  const orders = useMemo(() => generateMockOrders(225), []);
  const filteredOrders = useMemo(
    () => filterOrdersByDateRange(orders, dateRange),
    [orders, dateRange]
  );
  const zoneMetrics = useMemo(
    () => calculateZoneMetrics(filteredOrders, dateRange),
    [filteredOrders, dateRange]
  );

  // Time-series data for charts (memoized)
  const timeSeriesData = useMemo(
    () => aggregateZoneMetricsByDay(filteredOrders, dateRange, selectedMetric.id),
    [filteredOrders, dateRange, selectedMetric.id]
  );

  // Top zones for composition chart (memoized)
  const topZones = useMemo(
    () => getTopZonesByMetric(zoneMetrics, selectedMetric.id, 3),
    [zoneMetrics, selectedMetric.id]
  );

  // Get selected zone data
  const selectedZoneData = useMemo(
    () => (selectedZone ? zoneMetrics.find((z) => z.zoneId === selectedZone) : null),
    [selectedZone, zoneMetrics]
  );

  return (
    <div className="flex flex-col gap-4 pb-20 md:pb-6">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <h1 className="text-foreground text-xl font-bold">Zone Heat Map</h1>
      </div>

      {/* Desktop Header */}
      <AdminPageTitle
        title="Zone Heat Map Dashboard"
        description="Radial heatmap visualization with comprehensive zone analytics and trends"
      />

      {/* Experimental Warning */}
      <AdminInfoBox variant="warning">
        <strong>Experimental Feature:</strong> Using mock data for demonstration. This radial
        heatmap uses smooth gradients to show delivery density patterns and includes multiple chart
        types for comprehensive zone analysis.
      </AdminInfoBox>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
        <MetricSelector value={selectedMetric} onChange={setSelectedMetric} />
      </div>

      {/* Full Width Map */}
      <div className="w-full">
        <ZoneHeatmapMap
          zoneMetrics={zoneMetrics}
          selectedMetric={selectedMetric}
          onZoneClick={setSelectedZone}
          selectedZone={selectedZone}
        />
      </div>

      {/* Stats + Comparison Row */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Quick Stats */}
        <QuickStatsPanel metrics={zoneMetrics} />

        {/* Zone Comparison Chart */}
        <AdminCard>
          <AdminCardContent className="p-6">
            <h3 className="text-foreground mb-4 text-lg font-bold">Zone Ranking</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              All zones ranked by {selectedMetric.label.toLowerCase()}
            </p>
            <ZoneComparisonChart zoneMetrics={zoneMetrics} selectedMetric={selectedMetric} />
          </AdminCardContent>
        </AdminCard>
      </div>

      {/* Charts Section: Trend + Composition */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Zone Trend Chart */}
        <AdminCard>
          <AdminCardContent className="p-6">
            <h3 className="text-foreground mb-4 text-lg font-bold">Zone Trends</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Time-series comparison for top zones
            </p>
            <ZoneTrendChart
              timeSeriesData={timeSeriesData}
              selectedZones={topZones}
              selectedMetric={selectedMetric}
              zoneMetrics={zoneMetrics}
            />
          </AdminCardContent>
        </AdminCard>

        {/* Zone Composition Chart */}
        <AdminCard>
          <AdminCardContent className="p-6">
            <h3 className="text-foreground mb-4 text-lg font-bold">Zone Composition</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Market share distribution over time
            </p>
            <ZoneCompositionChart
              timeSeriesData={timeSeriesData}
              topZones={topZones}
              selectedMetric={selectedMetric}
              zoneMetrics={zoneMetrics}
            />
          </AdminCardContent>
        </AdminCard>
      </div>

      {/* Zone Details Panel (shown when zone selected) */}
      {selectedZoneData && (
        <ZoneDetailsPanel zone={selectedZoneData} onClose={() => setSelectedZone(null)} />
      )}
    </div>
  );
}
