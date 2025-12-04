"use client";

import { useMemo } from "react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { ZoneModal } from "@/components/marketplace/ZoneModal";
import { MarketplaceControlBar } from "@/components/marketplace/MarketplaceControlBar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { CategoryTabs } from "@/components/marketplace/CategoryTabs";
import { MOCK_PRODUCTS } from "@/lib/marketplace/product-data";
import { enrichProductsWithShipping } from "@/lib/marketplace/shipping-integration";
import {
  filterProducts,
  sortProducts,
  getPriceRange,
  groupProductsByZone,
} from "@/lib/marketplace/product-filters";
import { MarketplaceView } from "@/lib/marketplace/types";
import { MapPin, ShoppingBag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SORT_OPTIONS } from "@/lib/marketplace/types";
import { Search } from "lucide-react";

function MarketplaceContent() {
  const {
    userZone,
    currentView,
    serviceType,
    filterState,
    setFilterState,
    sortOption,
    setSortOption,
  } = useMarketplace();

  // Get price range for filter sidebar
  const priceRange = useMemo(() => getPriceRange(MOCK_PRODUCTS), []);

  // Enrich products with shipping estimates
  const productsWithShipping = useMemo(() => {
    return enrichProductsWithShipping(MOCK_PRODUCTS, userZone, serviceType);
  }, [userZone, serviceType]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = filterProducts(productsWithShipping, filterState);
    products = sortProducts(products, sortOption, userZone);
    return products;
  }, [productsWithShipping, filterState, sortOption, userZone]);

  // Group products by zone (for Proximity view)
  const groupedProducts = useMemo(() => {
    if (currentView === MarketplaceView.PROXIMITY) {
      return groupProductsByZone(filteredProducts, userZone);
    }
    return [];
  }, [filteredProducts, currentView, userZone]);

  const handleSearch = (query: string) => {
    setFilterState({ searchQuery: query });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Zone Modal */}
      <ZoneModal />

      {/* Marketplace Control Bar */}
      <MarketplaceControlBar />

      {/* Category Tabs (Uber Eats view) */}
      {currentView === MarketplaceView.UBER_EATS && (
        <div className="container mx-auto px-4">
          <CategoryTabs />
        </div>
      )}

      {/* Products Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Amazon View: Sidebar + Grid */}
          {currentView === MarketplaceView.AMAZON && (
            <div className="flex gap-6">
              <FilterSidebar priceRange={priceRange} className="hidden lg:block w-64 flex-shrink-0 self-start sticky top-20" />
              <div className="flex-1">
                {/* Search and Sort Bar */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={filterState.searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-48 bg-white border-2 border-gray-200">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Count */}
                <p className="text-sm text-gray-600 mb-4">
                  Showing {filteredProducts.length} products
                </p>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant={currentView}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Uber Eats View: Visual Cards with Category Tabs */}
          {currentView === MarketplaceView.UBER_EATS && (
            <div className="space-y-6">
              {/* Search and Sort Bar */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={filterState.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-48 bg-white border-2 border-gray-200">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={currentView}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pinterest View: Masonry Grid */}
          {currentView === MarketplaceView.PINTEREST && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={filterState.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={currentView}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Minimalist View: Spacious Grid */}
          {currentView === MarketplaceView.MINIMALIST && (
            <div className="space-y-12">
              {/* Centered Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={filterState.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20 text-center"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={currentView}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Proximity View: Zone-Grouped Sections */}
          {currentView === MarketplaceView.PROXIMITY && (
            <div className="space-y-12">
              {/* Search and Sort Bar */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={filterState.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-48 bg-white border-2 border-gray-200">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {groupedProducts.map(({ zone, products }) => (
                <section key={zone}>
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-secondary">
                      {zone === userZone ? "Available in Your Zone" : zone.replace("-", " ")}
                    </h2>
                    {zone === userZone && (
                      <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                        FAST DELIVERY
                      </span>
                    )}
                    <span className="text-sm text-gray-500">({products.length} products)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        variant={currentView}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-secondary mb-2">
                No products found
              </h2>
              <p className="text-gray-600">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function MarketplacePage() {
  return <MarketplaceContent />;
}
