"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Filter, X } from "lucide-react";
import { CATEGORY_OPTIONS, ProductCategory } from "@/lib/marketplace/types";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { GUATEMALA_ZONES } from "@/lib/types";
import { formatPrice } from "@/lib/marketplace/shipping-integration";

interface FilterSidebarProps {
  priceRange: { min: number; max: number };
  className?: string;
}

export function FilterSidebar({ priceRange, className = "" }: FilterSidebarProps) {
  const { filterState, setFilterState, resetFilters } = useMarketplace();

  const handleCategoryChange = (category: ProductCategory | "all") => {
    setFilterState({ category });
  };

  const handlePriceChange = (values: number[]) => {
    setFilterState({
      priceRange: { min: values[0], max: values[1] },
    });
  };

  const handleZoneToggle = (zone: string) => {
    const zones = filterState.zones.includes(zone)
      ? filterState.zones.filter((z) => z !== zone)
      : [...filterState.zones, zone];
    setFilterState({ zones });
  };

  const handleInStockToggle = () => {
    setFilterState({ inStock: !filterState.inStock });
  };

  const handleRatingChange = (rating: number) => {
    setFilterState({ minRating: rating });
  };

  const hasActiveFilters =
    filterState.category !== "all" ||
    filterState.priceRange.min !== priceRange.min ||
    filterState.priceRange.max !== priceRange.max ||
    filterState.zones.length > 0 ||
    filterState.inStock ||
    filterState.minRating > 0;

  return (
    <Card className={`bg-white border-2 border-primary/30 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-primary hover:text-primary/80"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-secondary mb-3">Category</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filterState.category === "all"
                  ? "bg-primary text-white font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              All Products
            </button>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filterState.category === cat.value
                    ? "bg-primary text-white font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range Filter */}
        <div>
          <h3 className="text-sm font-semibold text-secondary mb-3">Price Range</h3>
          <div className="space-y-4">
            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={10}
              value={[filterState.priceRange.min, filterState.priceRange.max]}
              onValueChange={handlePriceChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {formatPrice(filterState.priceRange.min)}
              </span>
              <span className="text-gray-600">
                {formatPrice(filterState.priceRange.max)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Rating Filter */}
        <div>
          <h3 className="text-sm font-semibold text-secondary mb-3">Minimum Rating</h3>
          <div className="space-y-2">
            {[4, 3, 2, 1, 0].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  filterState.minRating === rating
                    ? "bg-primary/10 border-2 border-primary"
                    : "hover:bg-gray-100 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating
                          ? "text-primary fill-primary"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-700">
                  {rating === 0 ? "All ratings" : `${rating}+ stars`}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Stock Filter */}
        <div>
          <h3 className="text-sm font-semibold text-secondary mb-3">Availability</h3>
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={filterState.inStock}
              onCheckedChange={handleInStockToggle}
            />
            <label
              htmlFor="in-stock"
              className="text-sm text-gray-700 cursor-pointer"
            >
              In stock only
            </label>
          </div>
        </div>

        <Separator />

        {/* Zone Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-secondary">Origin Zone</h3>
            {filterState.zones.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filterState.zones.length}
              </Badge>
            )}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {GUATEMALA_ZONES.slice(0, 10).map((zone) => (
              <div key={zone.value} className="flex items-center gap-2">
                <Checkbox
                  id={`zone-${zone.value}`}
                  checked={filterState.zones.includes(zone.value)}
                  onCheckedChange={() => handleZoneToggle(zone.value)}
                />
                <label
                  htmlFor={`zone-${zone.value}`}
                  className="text-sm text-gray-700 cursor-pointer flex-grow"
                >
                  {zone.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
