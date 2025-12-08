"use client";

import { useTranslations } from "next-intl";
import { useAdmin } from "@/lib/admin/admin-context";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { OrdersByCategoryChart } from "@/components/admin/charts/OrdersByCategoryChart";
import { OrdersByZoneChart } from "@/components/admin/charts/OrdersByZoneChart";
import { TopProductsChart } from "@/components/admin/charts/TopProductsChart";
import { Package, DollarSign, Clock, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/marketplace/shipping-integration";

export default function AdminDashboard() {
  const t = useTranslations("admin.dashboard.stats");
  const { metrics, revenueData, categoryData, zoneData, topProducts } = useAdmin();

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={t("totalOrders")}
          value={metrics.totalOrders.toLocaleString()}
          icon={Package}
          trend={{
            value: metrics.ordersGrowth,
            isPositive: metrics.ordersGrowth >= 0,
          }}
        />

        <StatsCard
          label={t("totalRevenue")}
          value={formatPrice(metrics.totalRevenue)}
          icon={DollarSign}
          trend={{
            value: metrics.revenueGrowth,
            isPositive: metrics.revenueGrowth >= 0,
          }}
        />

        <StatsCard
          label={t("pendingOrders")}
          value={metrics.pendingCount}
          icon={Clock}
          badge={
            metrics.pendingCount > 10
              ? { text: "Necesita atención", variant: "warning" }
              : undefined
          }
        />

        <StatsCard
          label={t("avgOrderValue")}
          value={formatPrice(metrics.avgOrderValue)}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Chart - spans 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        {/* Category Chart */}
        <OrdersByCategoryChart data={categoryData} />

        {/* Zone Chart */}
        <OrdersByZoneChart data={zoneData} />

        {/* Top Products Chart - spans 2 columns on large screens */}
        <div className="lg:col-span-2">
          <TopProductsChart data={topProducts} />
        </div>
      </div>
    </div>
  );
}
