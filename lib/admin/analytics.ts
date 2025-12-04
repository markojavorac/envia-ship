import { Order, ProductCategory } from "@/lib/marketplace/types";
import { format, startOfWeek, subDays } from "date-fns";

// Type definitions for analytics data
export interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  pendingCount: number;
  avgOrderValue: number;
  revenueGrowth: number; // Percentage change from previous period
  ordersGrowth: number;  // Percentage change from previous period
}

export interface RevenueDataPoint {
  date: string;         // Formatted date (e.g., "Jan 15")
  revenue: number;      // Total revenue for that week
  orderCount: number;   // Number of orders for that week
  weekStart: Date;      // Week start date for sorting
}

export interface CategoryDataPoint {
  category: string;     // Category label
  value: number;        // Order count
  percentage: number;   // Percentage of total
  fill: string;         // Color for chart
}

export interface ZoneDataPoint {
  zone: string;         // Zone label (e.g., "Zona 1")
  orderCount: number;   // Number of orders
  revenue: number;      // Total revenue from zone
}

export interface ProductSalesDataPoint {
  productName: string;  // Product name (truncated if needed)
  unitsSold: number;    // Total units sold
  revenue: number;      // Total revenue from product
  productId: string;    // Product ID for reference
}

/**
 * Calculate dashboard metrics with growth percentages
 */
export function calculateMetrics(orders: Order[]): DashboardMetrics {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  // Current period (last 30 days)
  const currentPeriodOrders = orders.filter(
    o => new Date(o.createdAt) >= thirtyDaysAgo
  );

  // Previous period (31-60 days ago)
  const previousPeriodOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
  });

  // Calculate current metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalCost, 0);
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate growth percentages
  const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const revenueGrowth = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : 0;

  const currentOrderCount = currentPeriodOrders.length;
  const previousOrderCount = previousPeriodOrders.length;
  const ordersGrowth = previousOrderCount > 0
    ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
    : 0;

  return {
    totalOrders,
    totalRevenue,
    pendingCount,
    avgOrderValue,
    revenueGrowth,
    ordersGrowth,
  };
}

/**
 * Aggregate revenue by week for the last 90 days
 */
export function aggregateRevenueByWeek(orders: Order[]): RevenueDataPoint[] {
  const now = new Date();
  const ninetyDaysAgo = subDays(now, 90);

  // Filter orders from last 90 days
  const recentOrders = orders.filter(
    o => new Date(o.createdAt) >= ninetyDaysAgo
  );

  // Group by week
  const weekMap = new Map<string, { revenue: number; count: number; weekStart: Date }>();

  recentOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const weekStart = startOfWeek(orderDate, { weekStartsOn: 1 }); // Monday start
    const weekKey = weekStart.toISOString();

    const existing = weekMap.get(weekKey) || { revenue: 0, count: 0, weekStart };
    weekMap.set(weekKey, {
      revenue: existing.revenue + order.totalCost,
      count: existing.count + 1,
      weekStart,
    });
  });

  // Convert to array and format
  const dataPoints: RevenueDataPoint[] = Array.from(weekMap.entries()).map(
    ([_, data]) => ({
      date: format(data.weekStart, "MMM d"),
      revenue: Math.round(data.revenue * 100) / 100, // Round to 2 decimals
      orderCount: data.count,
      weekStart: data.weekStart,
    })
  );

  // Sort by week start date
  return dataPoints.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
}

/**
 * Aggregate orders by category
 */
export function aggregateOrdersByCategory(orders: Order[]): CategoryDataPoint[] {
  const categoryMap = new Map<ProductCategory, number>();

  // Count orders by category
  orders.forEach(order => {
    const category = order.product.category;
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  const total = orders.length;

  // Category labels and colors (using actual HSL values to work in both SVG and HTML)
  const categoryInfo: Record<ProductCategory, { label: string; fill: string }> = {
    [ProductCategory.FOOD_BEVERAGES]: { label: "Food & Beverages", fill: "hsl(33 75% 62%)" },
    [ProductCategory.PHARMACY_MEDICAL]: { label: "Pharmacy & Medical", fill: "hsl(195 70% 60%)" },
    [ProductCategory.GENERAL_RETAIL]: { label: "General Retail", fill: "hsl(275 45% 65%)" },
  };

  // Convert to array
  const dataPoints: CategoryDataPoint[] = Array.from(categoryMap.entries()).map(
    ([category, count]) => ({
      category: categoryInfo[category].label,
      value: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      fill: categoryInfo[category].fill,
    })
  );

  // Sort by value (descending)
  return dataPoints.sort((a, b) => b.value - a.value);
}

/**
 * Aggregate orders by delivery zone
 */
export function aggregateOrdersByZone(orders: Order[]): ZoneDataPoint[] {
  const zoneMap = new Map<string, { count: number; revenue: number }>();

  // Count orders and sum revenue by zone
  orders.forEach(order => {
    const zone = order.deliveryZone;
    const existing = zoneMap.get(zone) || { count: 0, revenue: 0 };
    zoneMap.set(zone, {
      count: existing.count + 1,
      revenue: existing.revenue + order.totalCost,
    });
  });

  // Convert to array with formatted zone labels
  const dataPoints: ZoneDataPoint[] = Array.from(zoneMap.entries()).map(
    ([zone, data]) => ({
      zone: zone.replace("zona-", "Zona "),
      orderCount: data.count,
      revenue: Math.round(data.revenue * 100) / 100,
    })
  );

  // Sort by zone name
  return dataPoints.sort((a, b) => {
    const aNum = parseInt(a.zone.replace("Zona ", ""));
    const bNum = parseInt(b.zone.replace("Zona ", ""));
    return aNum - bNum;
  });
}

/**
 * Get top N products by units sold
 */
export function getTopProducts(orders: Order[], limit: number = 10): ProductSalesDataPoint[] {
  const productMap = new Map<string, { name: string; units: number; revenue: number }>();

  // Aggregate by product
  orders.forEach(order => {
    const productId = order.product.id;
    const existing = productMap.get(productId) || {
      name: order.product.name,
      units: 0,
      revenue: 0,
    };

    productMap.set(productId, {
      name: order.product.name,
      units: existing.units + order.quantity,
      revenue: existing.revenue + order.productTotal,
    });
  });

  // Convert to array
  const dataPoints: ProductSalesDataPoint[] = Array.from(productMap.entries()).map(
    ([productId, data]) => ({
      productName: data.name.length > 30 ? data.name.substring(0, 27) + "..." : data.name,
      unitsSold: data.units,
      revenue: Math.round(data.revenue * 100) / 100,
      productId,
    })
  );

  // Sort by units sold (descending) and take top N
  return dataPoints
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);
}

/**
 * Get order status distribution
 */
export function getOrderStatusDistribution(orders: Order[]): Record<string, number> {
  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
  };

  orders.forEach(order => {
    statusMap[order.status]++;
  });

  return statusMap;
}
