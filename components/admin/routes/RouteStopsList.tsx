"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RouteStop } from "@/lib/admin/route-types";
import { RouteStopCard } from "./RouteStopCard";
import { List, Trash2 } from "lucide-react";

interface RouteStopsListProps {
  /** Array of stops */
  stops: RouteStop[];
  /** Callback when a stop is deleted */
  onDelete: (stopId: string) => void;
  /** Callback to clear all stops */
  onClearAll?: () => void;
  /** Maximum stops allowed */
  maxStops?: number;
}

export function RouteStopsList({
  stops,
  onDelete,
  onClearAll,
  maxStops = 25,
}: RouteStopsListProps) {
  const hasStops = stops.length > 0;

  return (
    <Card className="bg-card border-border border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center gap-2 text-lg font-bold">
            <List className="h-5 w-5" />
            Current Stops ({stops.length}/{maxStops})
          </CardTitle>

          {hasStops && onClearAll && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive/80 border-destructive/30 hover:border-destructive/50"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {!hasStops ? (
          // Empty state
          <div className="text-muted-foreground py-12 text-center">
            <MapPinIcon className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
            <p className="font-medium">No stops added yet</p>
            <p className="mt-1 text-sm">Add at least 2 stops to optimize your route</p>
          </div>
        ) : (
          // Stops list
          <div className="space-y-2">
            {stops.map((stop, index) => (
              <RouteStopCard key={stop.id} stop={stop} index={index} onDelete={onDelete} />
            ))}
          </div>
        )}

        {/* Status messages */}
        {stops.length === 1 && (
          <div className="bg-primary/10 border-primary mt-4 rounded-md border-l-4 p-3">
            <p className="text-primary text-sm">
              ⚠️ Add at least one more stop to enable route optimization
            </p>
          </div>
        )}

        {stops.length >= maxStops && (
          <div className="bg-destructive/10 border-destructive mt-4 rounded-md border-l-4 p-3">
            <p className="text-destructive text-sm">
              ⚠️ Maximum number of stops ({maxStops}) reached
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for empty state icon
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}
