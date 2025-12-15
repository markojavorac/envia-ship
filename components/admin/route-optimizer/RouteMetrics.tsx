"use client";

import { TrendingDown, MapPin, Clock, DollarSign, Leaf } from "lucide-react";
import { AdminCard, AdminCardContent } from "@/components/admin/ui";
import type { OptimizedRoute } from "@/lib/admin/route-types";
import {
  createRouteComparison,
  formatDistance,
  formatTime,
  formatCurrency,
  formatWeight,
  formatPercent,
} from "@/lib/admin/route-optimizer/route-comparison-utils";

interface RouteMetricsProps {
  route: OptimizedRoute;
}

/**
 * RouteMetrics Component
 *
 * Displays comprehensive savings metrics for optimized route
 */
export function RouteMetrics({ route }: RouteMetricsProps) {
  const comparison = createRouteComparison(route);

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      <AdminCard className="py-0">
        <AdminCardContent>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="flex-shrink-0 rounded-full bg-green-500/10 p-3">
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-foreground text-xl font-bold">Route Optimized Successfully!</h3>
              <p className="text-muted-foreground mt-1">
                Saved {formatDistance(comparison.distanceSaved)} and {comparison.timeSaved} minutes
                on this route
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="rounded-full bg-green-500/10 px-4 py-2 text-green-600">
                <p className="text-3xl font-bold">{formatPercent(comparison.improvementPercent)}</p>
                <p className="text-xs font-semibold tracking-wide uppercase">Better</p>
              </div>
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Per-Route Savings */}
      <AdminCard title="Savings This Route" icon={TrendingDown}>
        <AdminCardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Distance Saved */}
            <MetricBox
              icon={MapPin}
              label="Distance Saved"
              value={formatDistance(comparison.distanceSaved)}
              subtitle="Less km driven"
              variant="success"
            />

            {/* Time Saved */}
            <MetricBox
              icon={Clock}
              label="Time Saved"
              value={formatTime(comparison.timeSaved)}
              subtitle="Faster delivery"
              variant="success"
            />

            {/* Fuel Cost Saved */}
            <MetricBox
              icon={DollarSign}
              label="Fuel Cost Saved"
              value={formatCurrency(comparison.fuelCostSaved)}
              subtitle="Per route"
              variant="success"
            />

            {/* CO2 Reduction */}
            <MetricBox
              icon={Leaf}
              label="CO₂ Reduction"
              value={formatWeight(comparison.co2Saved)}
              subtitle="Less emissions"
              variant="success"
            />
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Monthly Projection */}
      <AdminCard title="Monthly Projection" icon={DollarSign}>
        <AdminCardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              <strong className="text-foreground">Assuming 250 routes per month</strong> with
              similar optimization improvements:
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Monthly Fuel Savings */}
              <div className="bg-primary/5 border-primary/20 rounded-lg border-2 p-4">
                <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                  Monthly Fuel Savings
                </p>
                <p className="text-primary text-3xl font-bold">
                  {formatCurrency(comparison.monthlyFuelSavings)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatCurrency(comparison.monthlyFuelSavings * 12)} per year
                </p>
              </div>

              {/* Monthly Distance Saved */}
              <div className="rounded-lg border-2 border-green-500/20 bg-green-500/5 p-4">
                <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                  Monthly Distance Saved
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatDistance(comparison.monthlyDistanceSaved)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatDistance(comparison.monthlyDistanceSaved * 12)} per year
                </p>
              </div>

              {/* Monthly CO2 Reduction */}
              <div className="rounded-lg border-2 border-green-500/20 bg-green-500/5 p-4">
                <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
                  Monthly CO₂ Reduction
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatWeight(comparison.monthlyCo2Reduction)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatWeight(comparison.monthlyCo2Reduction * 12)} per year
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="border-primary/30 bg-primary/5 rounded-lg border-l-4 p-4">
              <p className="text-foreground text-sm">
                <strong>💰 ROI Opportunity:</strong> Route optimization could save{" "}
                <strong className="text-primary">
                  {formatCurrency(comparison.monthlyFuelSavings)}
                </strong>{" "}
                per month in fuel costs alone. That&rsquo;s{" "}
                <strong className="text-primary">
                  {formatCurrency(comparison.monthlyFuelSavings * 12)}
                </strong>{" "}
                per year in direct savings, plus reduced driver time and environmental impact.
              </p>
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}

/**
 * MetricBox Component - Individual metric display
 */
interface MetricBoxProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "success";
}

function MetricBox({ icon: Icon, label, value, subtitle, variant = "default" }: MetricBoxProps) {
  return (
    <div className="border-border hover:border-primary/30 flex items-start gap-3 rounded-lg border-2 p-4 transition-all">
      <div
        className={`flex-shrink-0 rounded-lg p-2 ${
          variant === "success" ? "bg-green-500/10" : "bg-primary/10"
        }`}
      >
        <Icon className={`h-5 w-5 ${variant === "success" ? "text-green-500" : "text-primary"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {label}
        </p>
        <p className="text-foreground mt-1 text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>}
      </div>
    </div>
  );
}
