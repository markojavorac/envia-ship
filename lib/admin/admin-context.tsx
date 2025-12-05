"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { Order, Product } from "@/lib/marketplace/types";
import { MOCK_PRODUCTS } from "@/lib/marketplace/product-data";
import { generateMockOrders } from "./mock-orders";
import {
  calculateMetrics,
  aggregateRevenueByWeek,
  aggregateOrdersByCategory,
  aggregateOrdersByZone,
  getTopProducts,
  type DashboardMetrics,
  type RevenueDataPoint,
  type CategoryDataPoint,
  type ZoneDataPoint,
  type ProductSalesDataPoint,
} from "./analytics";

// Order status type
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

// Admin context type
interface AdminContextType {
  // Data
  orders: Order[];
  products: Product[];

  // Order operations
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;

  // Product operations
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  getProductById: (productId: string) => Product | undefined;
  addProduct: (product: Omit<Product, "id" | "rating" | "reviews" | "featured" | "createdAt">) => void;

  // Analytics (memoized)
  metrics: DashboardMetrics;
  revenueData: RevenueDataPoint[];
  categoryData: CategoryDataPoint[];
  zoneData: ZoneDataPoint[];
  topProducts: ProductSalesDataPoint[];
}

// Create context with undefined default
const AdminContext = createContext<AdminContextType | undefined>(undefined);

/**
 * Admin provider component
 * Wraps admin pages and provides centralized state management
 */
export function AdminProvider({ children }: { children: React.ReactNode }) {
  // Initialize orders (generate 225 mock orders on mount)
  const [orders, setOrders] = useState<Order[]>(() => generateMockOrders(225));

  // Initialize products (reference existing mock products)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Order operations
  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  }, []);

  const getOrderById = useCallback(
    (orderId: string) => orders.find(order => order.id === orderId),
    [orders]
  );

  // Product operations
  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      )
    );
  }, []);

  const getProductById = useCallback(
    (productId: string) => products.find(product => product.id === productId),
    [products]
  );

  const addProduct = useCallback((productData: Omit<Product, "id" | "rating" | "reviews" | "featured" | "createdAt">) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rating: 4.5,
      reviews: 0,
      featured: false,
      createdAt: new Date(),
    };
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  }, []);

  // Memoized analytics computations (recompute only when orders change)
  const metrics = useMemo(() => calculateMetrics(orders), [orders]);
  const revenueData = useMemo(() => aggregateRevenueByWeek(orders), [orders]);
  const categoryData = useMemo(() => aggregateOrdersByCategory(orders), [orders]);
  const zoneData = useMemo(() => aggregateOrdersByZone(orders), [orders]);
  const topProducts = useMemo(() => getTopProducts(orders, 10), [orders]);

  const value: AdminContextType = {
    orders,
    products,
    updateOrderStatus,
    getOrderById,
    updateProduct,
    getProductById,
    addProduct,
    metrics,
    revenueData,
    categoryData,
    zoneData,
    topProducts,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

/**
 * Hook to access admin context
 * Throws error if used outside AdminProvider
 */
export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
