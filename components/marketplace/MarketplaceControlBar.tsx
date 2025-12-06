"use client";

import { ZoneSelector } from "./ZoneSelector";
import { UIStyleSwitcher } from "./UIStyleSwitcher";

export function MarketplaceControlBar() {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-secondary text-2xl font-bold md:text-3xl">Marketplace</h1>
          <div className="flex items-center gap-3">
            <ZoneSelector />
            <UIStyleSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
