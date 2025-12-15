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
    <div className="border-border bg-background sticky top-14 z-40 border-b py-4">
      <Tabs value={filterState.category} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary rounded-lg px-6 py-3 font-bold data-[state=active]:text-white"
          >
            All Products
          </TabsTrigger>
          {CATEGORY_OPTIONS.map((category) => {
            const Icon = CATEGORY_ICONS[category.value];
            return (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="data-[state=active]:bg-primary flex items-center gap-2 rounded-lg px-6 py-3 font-bold data-[state=active]:text-white"
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
