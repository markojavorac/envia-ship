"use client";

import { ZoneSelector } from "./ZoneSelector";
import { UIStyleSwitcher } from "./UIStyleSwitcher";

export function MarketplaceControlBar() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            Marketplace
          </h1>
          <div className="flex items-center gap-3">
            <ZoneSelector />
            <UIStyleSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
