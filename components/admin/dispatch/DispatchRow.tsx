"use client";

import { useEffect, useRef, useState } from "react";
import { DispatchEntry } from "@/lib/admin/dispatch-types";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DispatchRowProps {
  entry: DispatchEntry;
}

/**
 * Single dispatch terminal row (airport departure board style)
 *
 * Displays:
 * - Driver name & vehicle ID
 * - Vehicle badge
 * - Delivery zone badge
 * - Package loading progress
 * - Status badge
 * - Departure time
 *
 * Features:
 * - Flash animation on status change
 * - Large typography for TV displays
 * - High contrast colors
 */
export function DispatchRow({ entry }: DispatchRowProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const prevStatusRef = useRef(entry.status);

  // Flash effect when status changes
  useEffect(() => {
    if (prevStatusRef.current !== entry.status) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 2000);
      prevStatusRef.current = entry.status;
      return () => clearTimeout(timer);
    }
  }, [entry.status]);

  return (
    <div
      className={cn(
        "border-border/50 border-b px-4 py-5 transition-colors last:border-b-0",
        "xl:grid xl:grid-cols-[180px_180px_1fr_200px] xl:items-center xl:gap-8",
        "flex flex-col gap-3 xl:flex-none",
        isHighlighted && "bg-primary/5"
      )}
    >
      {/* Column 1: Driver ID */}
      <div>
        <div className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase xl:hidden">
          ID
        </div>
        <span className="text-foreground text-2xl font-bold tabular-nums">{entry.id}</span>
      </div>

      {/* Column 2: Shipment ID */}
      <div>
        <div className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase xl:hidden">
          Shipment
        </div>
        <span className="text-foreground text-xl font-semibold tabular-nums">
          {entry.shipmentId}
        </span>
      </div>

      {/* Column 3: Destination Zone */}
      <div>
        <div className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase xl:hidden">
          Destination
        </div>
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary text-base font-semibold"
        >
          {entry.deliveryZoneLabel}
        </Badge>
      </div>

      {/* Column 4: Status */}
      <div>
        <div className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase xl:hidden">
          Status
        </div>
        <StatusBadge status={entry.status} priority={entry.priority} />
      </div>
    </div>
  );
}
