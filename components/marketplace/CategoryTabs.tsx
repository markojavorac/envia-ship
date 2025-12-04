"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, Pill, ShoppingBag } from "lucide-react";
import { CATEGORY_OPTIONS, ProductCategory } from "@/lib/marketplace/types";
import { useMarketplace } from "@/contexts/MarketplaceContext";

const CATEGORY_ICONS = {
  food_beverages: Coffee,
  pharmacy_medical: Pill,
  general_retail: ShoppingBag,
};

export function CategoryTabs() {
  const { filterState, setFilterState } = useMarketplace();

  const handleCategoryChange = (value: string) => {
    setFilterState({ category: value as ProductCategory | "all" });
  };

  return (
    <div className="sticky top-14 z-40 bg-white border-b border-gray-200 py-4">
      <Tabs
        value={filterState.category}
        onValueChange={handleCategoryChange}
        className="w-full"
      >
        <TabsList className="w-full h-auto justify-start bg-transparent gap-2 p-0">
          <TabsTrigger
            value="all"
            className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-3 rounded-lg"
          >
            All Products
          </TabsTrigger>
          {CATEGORY_OPTIONS.map((category) => {
            const Icon = CATEGORY_ICONS[category.value];
            return (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
