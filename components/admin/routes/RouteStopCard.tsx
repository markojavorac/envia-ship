"use client";

import { RouteStop } from "@/lib/admin/route-types";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RouteStopCardProps {
  /** The route stop to display */
  stop: RouteStop;
  /** Index in the list (for display) */
  index: number;
  /** Callback when delete is clicked */
  onDelete: (stopId: string) => void;
}

export function RouteStopCard({ stop, index, onDelete }: RouteStopCardProps) {
  return (
    <div className="bg-muted hover:bg-muted/80 border-border flex items-center gap-3 rounded-md border p-3 transition-colors">
      {/* Index number */}
      <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
        {index + 1}
      </div>

      {/* Stop details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <MapPin className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">{stop.address}</p>
            {stop.zone && (
              <Badge variant="outline" className="mt-1 text-xs">
                {stop.zone.toUpperCase()}
              </Badge>
            )}
            {stop.notes && <p className="text-muted-foreground mt-1 text-xs">{stop.notes}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(stop.id)}
          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
