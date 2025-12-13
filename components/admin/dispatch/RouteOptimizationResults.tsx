/* eslint-disable custom/no-admin-hardcoded-colors */
/**
 * RouteOptimizationResults Component
 *
 * Displays before/after route comparison and business impact metrics.
 * Shows distance/time savings, fuel cost reduction, and CO2 impact.
 */

import { MapPin, TrendingDown, DollarSign, Leaf, Clock, Route as RouteIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { MetricBox } from "./MetricBox";
import type { OptimizedRoute } from "@/lib/admin/route-types";
import type { DeliveryTicket } from "@/lib/admin/driver-assist-types";
import {
  calculateBusinessMetrics,
  formatCurrency,
  formatWeight,
  formatPercent,
  formatDuration,
  formatDistance,
} from "@/lib/admin/route-metrics";
import { cn } from "@/lib/utils";

interface RouteOptimizationResultsProps {
  route: OptimizedRoute;
  tickets: DeliveryTicket[]; // Original ticket order
}

export function RouteOptimizationResults({ route, tickets }: RouteOptimizationResultsProps) {
  const t = useTranslations("admin.dispatch");

  // Calculate business metrics
  const metrics = calculateBusinessMetrics(route);

  // Reconstruct original order (tickets array is now in optimized order from parent)
  // We need to show the original sequence vs optimized sequence
  const originalOrder = route.optimizedStops.map((stop, index) => ({
    sequenceNumber: index + 1,
    address: stop.address,
    notes: stop.notes,
  }));

  const optimizedOrder = route.optimizedStops.map((stop, index) => ({
    sequenceNumber: stop.sequenceNumber || index + 1,
    address: stop.address,
    notes: stop.notes,
  }));

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <AdminCard>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 rounded-full bg-green-500/10 p-3">
            <TrendingDown className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-foreground text-xl font-bold">{t("optimizedSuccessfully")}</h3>
            <p className="text-muted-foreground mt-1">
              {t("savedDistance", {
                distance: formatDistance(metrics.distanceSaved),
                time: `${metrics.timeSaved} ${t("minutes", { count: metrics.timeSaved })}`,
              })}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="rounded-full bg-green-500/10 px-4 py-2 text-green-600">
              <p className="text-3xl font-bold">{formatPercent(metrics.improvementPercent)}</p>
              <p className="text-xs font-semibold tracking-wide uppercase">{t("better")}</p>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Before/After Comparison */}
      <AdminCard title={t("routeComparison")} icon={RouteIcon}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* BEFORE (Original) */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
                {t("beforeOriginal")}
              </h4>
              <span className="text-muted-foreground text-xs">{t("enteredSequence")}</span>
            </div>

            <div className="mb-4 space-y-2">
              {originalOrder.map((stop) => (
                <div
                  key={stop.sequenceNumber}
                  className="border-border bg-card flex items-start gap-2 rounded border p-2"
                >
                  <div className="bg-muted text-muted-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {stop.sequenceNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground line-clamp-2 text-sm">{stop.address}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Original Metrics */}
            <div className="bg-muted/30 border-border rounded-lg border p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">{t("distance")}</p>
                  <p className="text-foreground text-lg font-bold">
                    {formatDistance(metrics.originalDistance)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t("time")}</p>
                  <p className="text-foreground text-lg font-bold">
                    {formatDuration(metrics.originalTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AFTER (Optimized) */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold tracking-wide text-green-600 uppercase">
                {t("afterOptimized")}
              </h4>
              <span className="text-xs font-semibold text-green-600">{t("nearestNeighbor")}</span>
            </div>

            <div className="mb-4 space-y-2">
              {optimizedOrder.map((stop) => (
                <div
                  key={stop.sequenceNumber}
                  className={cn(
                    "flex items-start gap-2 rounded border-2 p-2 transition-all",
                    "border-green-500/30 bg-green-500/5"
                  )}
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                    {stop.sequenceNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground line-clamp-2 text-sm font-medium">
                      {stop.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Optimized Metrics */}
            <div className="rounded-lg border-2 border-green-500/30 bg-green-500/10 p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-green-600">{t("distance")}</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatDistance(metrics.optimizedDistance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-600">{t("time")}</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatDuration(metrics.optimizedTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Business Impact Metrics */}
      <AdminCard title={t("businessImpact")} icon={TrendingDown}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Distance Saved */}
          <MetricBox
            label={t("distanceSaved")}
            value={formatDistance(metrics.distanceSaved)}
            improvement={formatPercent(metrics.distanceSavedPercent)}
            icon={MapPin}
            variant="success"
          />

          {/* Time Saved */}
          <MetricBox
            label={t("timeSaved")}
            value={`${metrics.timeSaved} min`}
            improvement={formatPercent(metrics.timeSavedPercent)}
            icon={Clock}
            variant="success"
          />

          {/* Fuel Cost Saved */}
          <MetricBox
            label={t("fuelCostSaved")}
            value={formatCurrency(metrics.fuelCostSaved)}
            subtitle={t("perRoute")}
            icon={DollarSign}
          />

          {/* CO2 Reduction */}
          <MetricBox
            label={t("co2Reduction")}
            value={formatWeight(metrics.co2Saved)}
            subtitle={t("carbonSavings")}
            icon={Leaf}
            variant="success"
          />
        </div>

        {/* Monthly Projection */}
        <div className="border-border mt-6 border-t pt-6">
          <h4 className="text-foreground mb-3 text-sm font-bold">{t("monthlyProjection")}</h4>
          <p className="text-muted-foreground mb-2 text-sm">
            {t("assumingRoutes", { count: 250 })}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
              <p className="text-muted-foreground mb-1 text-xs">{t("monthlyFuelSavings")}</p>
              <p className="text-primary text-2xl font-bold">
                {formatCurrency(metrics.fuelCostSavedMonthly)}
              </p>
            </div>
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <p className="text-muted-foreground mb-1 text-xs">{t("monthlyCo2Reduction")}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatWeight(metrics.co2SavedMonthly)}
              </p>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
