"use client";

import { DispatchEntry, DispatchStatus } from "@/lib/admin/dispatch-types";
import { sortDispatchEntries } from "@/lib/admin/dispatch-utils";
import { DispatchRow } from "./DispatchRow";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DispatchBoardProps {
  entries: DispatchEntry[];
  lastUpdate?: Date;
}

/**
 * Main dispatch terminal board (simplified for drivers)
 *
 * Features:
 * - Simple LIVE indicator (green dot)
 * - 4-column layout (ID, Shipment ID, Destination, Status)
 * - "Now Loading" indicator showing current driver
 * - Only shows active entries (no DEPARTED)
 * - Sorted entries (READY > LOADING > WAITING)
 */
export function DispatchBoard({ entries, lastUpdate = new Date() }: DispatchBoardProps) {
  // Filter out DEPARTED entries - only show active drivers
  const activeEntries = entries.filter(entry => entry.status !== DispatchStatus.DEPARTED);
  const sortedEntries = sortDispatchEntries(activeEntries);

  // Find the first LOADING entry to display in "Now Loading" indicator
  const loadingEntry = sortedEntries.find(e => e.status === DispatchStatus.LOADING);

  return (
    <Card className="bg-card border-border rounded-md">
      <CardHeader className="pb-2">
        {/* Now Loading Indicator */}
        {loadingEntry && (
          <div className="mb-6 p-4 bg-primary/10 border-l-4 border-primary rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Now Loading
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary tabular-nums">
                    {loadingEntry.id}
                  </span>
                  <span className="text-lg text-foreground font-semibold">
                    {loadingEntry.shipmentId}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {loadingEntry.loadedPackages} / {loadingEntry.packageCount} packages
                  </span>
                </div>
              </div>
              <Badge className="bg-primary text-white text-base px-4 py-2">
                LOADING
              </Badge>
            </div>
          </div>
        )}

        {/* Column Headers - 4 columns now, bigger text */}
        <div className="hidden xl:grid xl:grid-cols-[180px_180px_1fr_200px] gap-8 px-4 pb-4 border-b border-border">
          <div className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
            ID
          </div>
          <div className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
            Shipment
          </div>
          <div className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
            Destination
          </div>
          <div className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
            Status
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Board Rows */}
        <div>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No active dispatches
            </div>
          ) : (
            sortedEntries.map((entry) => (
              <DispatchRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
