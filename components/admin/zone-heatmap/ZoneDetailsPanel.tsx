"use client";

import { X, Package, DollarSign, Clock, TrendingUp } from "lucide-react";
import { AdminCard, AdminCardContent } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import type { ZoneMetrics } from "@/lib/admin/zone-analytics/types";
import { HourlyPatternChart } from "./charts/HourlyPatternChart";
import { DailyPatternChart } from "./charts/DailyPatternChart";

interface ZoneDetailsPanelProps {
  zone: ZoneMetrics;
  onClose: () => void;
}

/**
 * Zone Details Panel Component
 *
 * Displays detailed analytics for a selected zone including:
 * - Key metrics (orders, revenue, delivery time, success rate)
 * - Hourly pattern chart
 * - Daily pattern chart
 */
export function ZoneDetailsPanel({ zone, onClose }: ZoneDetailsPanelProps) {
  return (
    <AdminCard>
      <AdminCardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-foreground text-lg font-bold">{zone.zoneName}</h3>
            <p className="text-muted-foreground mt-1 text-sm">Delivery zone analytics</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-muted -mt-2 -mr-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Orders */}
          <div className="bg-muted/30 rounded-md p-3">
            <div className="mb-2 flex items-center gap-2">
              <Package className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-xs font-semibold">Orders</span>
            </div>
            <p className="text-foreground text-2xl font-bold">{zone.orderCount}</p>
          </div>

          {/* Revenue */}
          <div className="bg-muted/30 rounded-md p-3">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-xs font-semibold">Revenue</span>
            </div>
            <p className="text-foreground text-2xl font-bold">Q{zone.totalRevenue.toFixed(2)}</p>
          </div>

          {/* Avg Time */}
          <div className="bg-muted/30 rounded-md p-3">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-xs font-semibold">Avg Delivery</span>
            </div>
            <p className="text-foreground text-2xl font-bold">{zone.avgDeliveryTime.toFixed(1)}h</p>
          </div>

          {/* Success Rate */}
          <div className="bg-muted/30 rounded-md p-3">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-xs font-semibold">Success Rate</span>
            </div>
            <p className="text-foreground text-2xl font-bold">
              {zone.deliverySuccessRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Hourly Pattern */}
          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold">Hourly Activity Pattern</h4>
            <HourlyPatternChart data={zone.peakHours} />
          </div>

          {/* Daily Pattern */}
          <div>
            <h4 className="text-foreground mb-3 text-sm font-semibold">Daily Activity Pattern</h4>
            <DailyPatternChart data={zone.peakDays} />
          </div>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}
