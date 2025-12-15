"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DriverStatusCards from "./DriverStatusCards";
import MapControls from "./MapControls";
import DriverHighlight from "./DriverHighlight";
import type { TrackedDriver, MapFilters, DriverStats } from "@/lib/admin/driver-tracking/types";

interface MapStyle {
  id: string;
  name: string;
  url: string;
}

interface MobileControlsProps {
  stats: DriverStats;
  selectedDriver: TrackedDriver | null;
  filters: MapFilters;
  onFilterChange: (filters: MapFilters) => void;
  onZoomToSelected: () => void;
  onResetView: () => void;
  currentStyle: string;
  mapStyles: MapStyle[];
  onStyleChange: (styleId: string) => void;
}

export default function MobileControls({
  stats,
  selectedDriver,
  filters,
  onFilterChange,
  onZoomToSelected,
  onResetView,
  currentStyle,
  mapStyles,
  onStyleChange,
}: MobileControlsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="bg-card border-border fixed bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full border-2 px-6 py-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-foreground font-semibold">{stats.activeCount} Active</span>
        </div>
      </button>

      {/* Bottom Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Driver Tracking</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <DriverStatusCards stats={stats} />
            {selectedDriver && <DriverHighlight driver={selectedDriver} />}
            <MapControls
              filters={filters}
              onFilterChange={onFilterChange}
              onZoomToSelected={onZoomToSelected}
              onResetView={onResetView}
              hasSelection={!!selectedDriver}
              currentStyle={currentStyle}
              mapStyles={mapStyles}
              onStyleChange={onStyleChange}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
