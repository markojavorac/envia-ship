"use client";

import { ZoneSelector } from "./ZoneSelector";
import { UIStyleSwitcher } from "./UIStyleSwitcher";

export function MarketplaceControlBar() {
  return (
    <div className="border-border bg-background sticky top-0 z-10 border-b">
      <div className="container mx-auto px-4 py-4 xl:px-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-foreground text-2xl font-bold md:text-3xl">Marketplace</h1>
          <div className="flex items-center gap-3">
            <ZoneSelector />
            <UIStyleSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
