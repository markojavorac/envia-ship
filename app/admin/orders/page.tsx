"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/admin/admin-context";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { Package, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/marketplace/shipping-integration";
import type { Order } from "@/lib/marketplace/types";

export default function OrdersPage() {
  const { orders, metrics } = useAdmin();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Calculate additional metrics
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          icon={Package}
          trend={{
            value: metrics.ordersGrowth,
            isPositive: metrics.ordersGrowth >= 0,
          }}
        />

        <StatsCard
          label="Pending Orders"
          value={metrics.pendingCount}
          icon={Clock}
          badge={
            metrics.pendingCount > 10
              ? { text: "Needs attention", variant: "warning" }
              : undefined
          }
        />

        <StatsCard
          label="In Progress"
          value={confirmedCount + shippedCount}
          icon={Package}
        />

        <StatsCard
          label="Delivered"
          value={deliveredCount}
          icon={CheckCircle2}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-md border border-border p-4">
        <div className="mb-3">
          <h2 className="text-xl font-bold text-foreground">All Orders</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track your marketplace orders
          </p>
        </div>

        <OrdersTable orders={orders} onViewOrder={handleViewOrder} />
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
