"use client";

/**
 * Route Details Table
 *
 * Displays detailed breakdown of each vehicle's route with expandable stops.
 */

import { useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import type { FleetSolution } from "@/lib/admin/fleet-types";
import { getVehicleRouteStats } from "@/lib/admin/fleet-optimizer/fleet-metrics";

interface RouteDetailsTableProps {
  solution: FleetSolution;
}

export function RouteDetailsTable({ solution }: RouteDetailsTableProps) {
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  const toggleRoute = (vehicleId: string) => {
    const updated = new Set(expandedRoutes);
    if (updated.has(vehicleId)) {
      updated.delete(vehicleId);
    } else {
      updated.add(vehicleId);
    }
    setExpandedRoutes(updated);
  };

  // Show only non-empty routes
  const nonEmptyRoutes = solution.routes.filter((r) => !r.isEmpty);

  if (nonEmptyRoutes.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-lg font-bold">Route Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">No routes assigned yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-lg font-bold">Route Details</CardTitle>
        <p className="text-muted-foreground text-sm">
          {nonEmptyRoutes.length} {nonEmptyRoutes.length === 1 ? "route" : "routes"} with stops
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="text-foreground font-semibold">Vehicle</TableHead>
              <TableHead className="text-foreground font-semibold">Stops</TableHead>
              <TableHead className="text-foreground font-semibold">Distance</TableHead>
              <TableHead className="text-foreground font-semibold">Time</TableHead>
              <TableHead className="text-foreground font-semibold">Packages</TableHead>
              <TableHead className="text-foreground font-semibold">Utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nonEmptyRoutes.map((route) => {
              const stats = getVehicleRouteStats(route);
              const isExpanded = expandedRoutes.has(route.vehicleId);

              return (
                <Fragment key={route.vehicleId}>
                  <TableRow
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleRoute(route.vehicleId)}
                  >
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: stats.vehicleColor }}
                        />
                        <span className="text-foreground font-medium">{stats.vehicleLabel}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{stats.stopCount}</TableCell>
                    <TableCell className="text-foreground">{stats.distance}</TableCell>
                    <TableCell className="text-foreground">{stats.time}</TableCell>
                    <TableCell className="text-foreground">
                      {stats.packages} / {stats.capacity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`font-semibold ${stats.utilizationColor}`}
                      >
                        {stats.utilization}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* Expanded stops */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <div className="space-y-2">
                          <h4 className="text-foreground mb-3 text-sm font-semibold">
                            Route Sequence:
                          </h4>
                          {route.stops.map((stop, index) => (
                            <div
                              key={stop.id}
                              className="bg-background border-border flex items-start gap-3 rounded border p-2"
                            >
                              <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <MapPin className="text-muted-foreground h-3 w-3" />
                                  <span className="text-foreground text-sm font-medium">
                                    {stop.address}
                                  </span>
                                </div>
                                {stop.notes && (
                                  <p className="text-muted-foreground mt-1 text-xs">{stop.notes}</p>
                                )}
                                {stop.packageCount && stop.packageCount > 1 && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {stop.packageCount} packages
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
