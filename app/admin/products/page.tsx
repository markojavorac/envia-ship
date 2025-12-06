"use client";

import Link from "next/link";
import { useAdmin } from "@/lib/admin/admin-context";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { StatsCard } from "@/components/admin/StatsCard";
import { Button } from "@/components/ui/button";
import { Package, AlertCircle, TrendingUp, ShoppingBag, Plus } from "lucide-react";

export default function ProductsPage() {
  const { products, updateProduct } = useAdmin();

  // Calculate product metrics
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 30).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Products" value={totalProducts} icon={ShoppingBag} />

        <StatsCard
          label="Low Stock"
          value={lowStockCount}
          icon={AlertCircle}
          badge={lowStockCount > 0 ? { text: "Needs restock", variant: "warning" } : undefined}
        />

        <StatsCard
          label="Out of Stock"
          value={outOfStockCount}
          icon={Package}
          badge={
            outOfStockCount > 0
              ? { text: "Urgent", variant: "warning" }
              : { text: "All stocked", variant: "success" }
          }
        />

        <StatsCard label="Avg Product Price" value={`Q${avgPrice.toFixed(2)}`} icon={TrendingUp} />
      </div>

      {/* Products Table */}
      <div className="bg-card border-border rounded-md border p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="text-foreground text-xl font-bold">Product Catalog</h2>
            <p className="text-muted-foreground text-sm">
              Manage your marketplace products and inventory
            </p>
          </div>
          <Link href="/admin/products/new">
            <Button className="bg-primary hover:bg-primary/90 font-semibold text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        <ProductsTable products={products} onUpdateProduct={updateProduct} />
      </div>
    </div>
  );
}
