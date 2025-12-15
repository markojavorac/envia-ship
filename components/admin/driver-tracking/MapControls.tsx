import { ZoomIn, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminCard, AdminCardContent } from "@/components/admin/ui";
import type { MapFilters } from "@/lib/admin/driver-tracking/types";

interface MapStyle {
  id: string;
  name: string;
  url: string;
}

interface MapControlsProps {
  filters: MapFilters;
  onFilterChange: (filters: MapFilters) => void;
  onZoomToSelected: () => void;
  onResetView: () => void;
  hasSelection: boolean;
  currentStyle: string;
  mapStyles: MapStyle[];
  onStyleChange: (styleId: string) => void;
}

export default function MapControls({
  filters,
  onFilterChange,
  onZoomToSelected,
  onResetView,
  hasSelection,
  currentStyle,
  mapStyles,
  onStyleChange,
}: MapControlsProps) {
  return (
    <AdminCard className="bg-card/95 border-border backdrop-blur-sm">
      <AdminCardContent className="space-y-4 p-4">
        {/* Status Filters */}
        <div>
          <p className="text-foreground mb-2 text-sm font-semibold">Show Drivers</p>
          <div className="flex flex-col gap-2">
            {/* Active Filter */}
            <Button
              variant={filters.showActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange({ ...filters, showActive: !filters.showActive })}
              className="justify-start"
            >
              <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
              Active
            </Button>

            {/* Available Filter */}
            <Button
              variant={filters.showAvailable ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  showAvailable: !filters.showAvailable,
                })
              }
              className="justify-start"
            >
              <div className="bg-primary mr-2 h-2 w-2 rounded-full" />
              Available
            </Button>

            {/* Offline Filter */}
            <Button
              variant={filters.showOffline ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  showOffline: !filters.showOffline,
                })
              }
              className="justify-start"
            >
              <div className="bg-muted-foreground mr-2 h-2 w-2 rounded-full" />
              Offline
            </Button>
          </div>
        </div>

        <Separator />

        {/* Map Style Switcher */}
        <div>
          <p className="text-foreground mb-2 text-sm font-semibold">Map Style</p>
          <Select value={currentStyle} onValueChange={onStyleChange}>
            <SelectTrigger className="bg-card border-border focus:border-primary focus:ring-primary/20 border-2">
              <SelectValue placeholder="Select map style" />
            </SelectTrigger>
            <SelectContent>
              {mapStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Map Actions */}
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onZoomToSelected}
            disabled={!hasSelection}
            className="w-full"
          >
            <ZoomIn className="mr-2 h-4 w-4" />
            Zoom to Selected
          </Button>
          <Button size="sm" variant="outline" onClick={onResetView} className="w-full">
            <Maximize2 className="mr-2 h-4 w-4" />
            Reset View
          </Button>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}
