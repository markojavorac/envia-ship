"use client";

import { Package, DollarSign, Clock, TrendingUp } from "lucide-react";
import { AdminCard, AdminCardContent } from "@/components/admin/ui";
import type { ZoneMetrics } from "@/lib/admin/zone-analytics/types";
import { calculateOverallStats } from "@/lib/admin/zone-analytics/aggregators";

interface QuickStatsPanelProps {
  metrics: ZoneMetrics[];
}

/**
 * Quick Stats Panel Component
 *
 * Displays aggregated metrics across all zones
 */
export function QuickStatsPanel({ metrics }: QuickStatsPanelProps) {
  if (metrics.length === 0) {
    return (
      <AdminCard>
        <AdminCardContent className="p-6">
          <h3 className="text-foreground mb-4 text-lg font-bold">Overall Metrics</h3>
          <p className="text-muted-foreground text-sm">No data available</p>
        </AdminCardContent>
      </AdminCard>
    );
  }

  const stats = calculateOverallStats(metrics);

  return (
    <AdminCard>
      <AdminCardContent className="p-6">
        <h3 className="text-foreground mb-4 text-lg font-bold">Overall Metrics</h3>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Orders */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-sm">Total Orders</span>
            </div>
            <p className="text-foreground text-2xl font-bold">{stats.totalOrders}</p>
          </div>

          {/* Total Revenue */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-sm">Total Revenue</span>
            </div>
            <p className="text-foreground text-2xl font-bold">Q{stats.totalRevenue.toFixed(2)}</p>
          </div>

          {/* Avg Delivery Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-sm">Avg Delivery</span>
            </div>
            <p className="text-foreground text-2xl font-bold">
              {stats.avgDeliveryTime.toFixed(1)}h
            </p>
          </div>

          {/* Success Rate */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-sm">Success Rate</span>
            </div>
            <p className="text-foreground text-2xl font-bold">
              {stats.overallSuccessRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Top Zones */}
        {stats.topZones.length > 0 && (
          <div className="border-border mt-6 border-t pt-4">
            <h4 className="text-foreground mb-3 text-sm font-semibold">Top Zones</h4>
            <div className="space-y-2">
              {stats.topZones.map((zone, index) => (
                <div key={zone.zoneId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-foreground text-sm font-medium">{zone.zoneName}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">{zone.orderCount} orders</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AdminCardContent>
    </AdminCard>
  );
}
