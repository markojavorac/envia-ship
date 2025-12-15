"use client";

import { useContext } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Layout } from "lucide-react";
import { VIEW_OPTIONS } from "@/lib/marketplace/types";
import { MarketplaceContext } from "@/contexts/MarketplaceContext";

export function UIStyleSwitcher() {
  const context = useContext(MarketplaceContext);

  // Return null if not in marketplace context
  if (!context) return null;

  const { currentView, setCurrentView } = context;

  return (
    <Select value={currentView} onValueChange={setCurrentView}>
      <SelectTrigger className="text-foreground hover:border-primary/50 focus:border-primary focus:ring-primary/20 border-border bg-card w-32 border-2 font-semibold">
        <Layout className="text-primary mr-2 h-4 w-4" />
        <span>Layout</span>
      </SelectTrigger>
      <SelectContent className="z-[100]">
        {VIEW_OPTIONS.map((view) => (
          <SelectItem key={view.value} value={view.value}>
            <div className="flex flex-col">
              <span className="font-semibold">{view.label}</span>
              <span className="text-muted-foreground text-xs">{view.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
