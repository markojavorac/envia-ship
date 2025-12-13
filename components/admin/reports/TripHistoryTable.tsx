"use client";

import { useState } from "react";
import { MapPin, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TripData {
  id: string;
  ticketNumber?: string;
  driverName: string;
  driverId: string;
  originAddress: string;
  destinationAddress: string;
  createdAt: Date;
  navigationStartedAt?: Date;
  completedAt?: Date;
  durationMs: number | null;
  durationMinutes: number | null;
}

interface TripHistoryTableProps {
  trips: TripData[];
  isLoading: boolean;
}

type SortField = "createdAt" | "completedAt" | "durationMinutes" | "driverName";
type SortDirection = "asc" | "desc";

export function TripHistoryTable({ trips, isLoading }: TripHistoryTableProps) {
  const [sortField, setSortField] = useState<SortField>("completedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Sort trips
  const sortedTrips = [...trips].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortField) {
      case "createdAt":
        aVal = a.createdAt.getTime();
        bVal = b.createdAt.getTime();
        break;
      case "completedAt":
        aVal = a.completedAt?.getTime() ?? 0;
        bVal = b.completedAt?.getTime() ?? 0;
        break;
      case "durationMinutes":
        aVal = a.durationMinutes ?? 0;
        bVal = b.durationMinutes ?? 0;
        break;
      case "driverName":
        aVal = a.driverName.toLowerCase();
        bVal = b.driverName.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 inline h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 inline h-4 w-4" />
    );
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (trips.length === 0 && !isLoading) {
    return (
      <div className="border-border bg-card rounded-lg border p-12 text-center">
        <CheckCircle2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <p className="text-foreground text-lg font-semibold">No completed trips yet</p>
        <p className="text-muted-foreground mt-1 text-sm">Completed deliveries will appear here</p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-foreground">Ticket</TableHead>
              <TableHead
                className="text-foreground hover:text-primary cursor-pointer"
                onClick={() => handleSort("driverName")}
              >
                Driver
                <SortIcon field="driverName" />
              </TableHead>
              <TableHead className="text-foreground">Route</TableHead>
              <TableHead
                className="text-foreground hover:text-primary cursor-pointer"
                onClick={() => handleSort("completedAt")}
              >
                Completed
                <SortIcon field="completedAt" />
              </TableHead>
              <TableHead
                className="text-foreground hover:text-primary cursor-pointer text-right"
                onClick={() => handleSort("durationMinutes")}
              >
                Duration
                <SortIcon field="durationMinutes" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrips.map((trip) => (
              <TableRow
                key={trip.id}
                className="border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => setExpandedRow(expandedRow === trip.id ? null : trip.id)}
              >
                <TableCell className="text-foreground font-medium">
                  {trip.ticketNumber ? (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary font-mono"
                    >
                      {trip.ticketNumber}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">No ticket #</span>
                  )}
                </TableCell>
                <TableCell className="text-foreground">{trip.driverName}</TableCell>
                <TableCell>
                  <div className="max-w-md space-y-1">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-foreground text-sm">
                        {expandedRow === trip.id
                          ? trip.originAddress
                          : trip.originAddress.length > 40
                            ? `${trip.originAddress.slice(0, 40)}...`
                            : trip.originAddress}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-foreground text-sm">
                        {expandedRow === trip.id
                          ? trip.destinationAddress
                          : trip.destinationAddress.length > 40
                            ? `${trip.destinationAddress.slice(0, 40)}...`
                            : trip.destinationAddress}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {trip.completedAt
                    ? trip.completedAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Clock className="text-primary h-4 w-4" />
                    <span className="text-foreground font-semibold">
                      {formatDuration(trip.durationMinutes)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer with count */}
      <div className="border-border bg-muted/20 border-t px-4 py-2 text-right">
        <span className="text-muted-foreground text-sm">
          Showing {sortedTrips.length} {sortedTrips.length === 1 ? "trip" : "trips"}
        </span>
      </div>
    </div>
  );
}
